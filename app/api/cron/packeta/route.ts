import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { sendInvoiceLinkEmail, sendPacketaStatusEmail, sendReturnNoticeEmail } from '@/app/lib/email/order-confirmation';
import { fetchPacketaStatus, mapPacketaStatusToOrderStatus } from '@/app/lib/packeta-status';
import { createInvoiceForOrder } from '@/app/lib/invoice/create-invoice';

const RETURN_NOTIFY_AFTER = process.env.RETURN_NOTIFY_AFTER ? new Date(process.env.RETURN_NOTIFY_AFTER) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

const emailStatusCodes = new Set([2, 4, 5]);

const resolvePaymentStatus = (newStatus: OrderStatus, paymentMethod: string, current: PaymentStatus) => {
  if (newStatus === OrderStatus.completed) return PaymentStatus.paid;
  if (newStatus === OrderStatus.cancelled) {
    if (paymentMethod === 'cod') return PaymentStatus.failed;
    // For prepaid, mark refunded to unblock finance flow
    return PaymentStatus.refunded;
  }
  return current;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const toCheck = await prisma.order.findMany({
      where: {
        meta: { some: { key: '_packeta_packet_id' } },
        status: { notIn: [OrderStatus.completed, OrderStatus.cancelled] }
      },
      include: { meta: true, items: true, addresses: true }
    });

    let updated = 0;
    for (const order of toCheck) {
      const packetId = order.meta.find(m => m.key === '_packeta_packet_id')?.value as string | undefined;
      const barcode = order.meta.find(m => m.key === '_packeta_barcode')?.value as string | undefined;
      const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email;
      if (!packetId) continue;
      try {
        const status = await fetchPacketaStatus(packetId);
        const newStatus = mapPacketaStatusToOrderStatus(status.code);
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              paymentStatus: resolvePaymentStatus(newStatus, order.paymentMethod, order.paymentStatus),
            }
          });

          const existingCode = await tx.orderMeta.findFirst({
            where: { orderId: order.id, key: '_packeta_status_code' }
          });
          if (existingCode) {
            await tx.orderMeta.update({ where: { id: existingCode.id }, data: { value: String(status.code) } });
          } else {
            await tx.orderMeta.create({ data: { orderId: order.id, key: '_packeta_status_code', value: String(status.code) } });
          }

          const existingText = await tx.orderMeta.findFirst({
            where: { orderId: order.id, key: '_packeta_status_text' }
          });
          if (existingText) {
            await tx.orderMeta.update({ where: { id: existingText.id }, data: { value: status.text } });
          } else {
            await tx.orderMeta.create({ data: { orderId: order.id, key: '_packeta_status_text', value: status.text } });
          }
        });
        updated += 1;
        if (newStatus === OrderStatus.completed) {
          const invoiceResult = await createInvoiceForOrder(order).catch(err => {
            console.warn(`[invoice] failed for order ${order.id}`, err);
            return null;
          });
          if (invoiceResult && billingEmail) {
            sendInvoiceLinkEmail(order as Prisma.OrderGetPayload<{ include: { items: true; addresses: true } }>, billingEmail, invoiceResult.url, invoiceResult.invoiceNumber)
              .catch(err => console.warn(`[invoice email] failed for order ${order.id}`, err));
          }
        }
        const notifiedCode = order.meta.find(m => m.key === '_packeta_status_notified_code')?.value;
        if (billingEmail && emailStatusCodes.has(status.code) && String(status.code) !== notifiedCode) {
          try {
            await sendPacketaStatusEmail(order as Prisma.OrderGetPayload<{ include: { items: true; addresses: true } }>, billingEmail, status.code, barcode);
            const existingNotified = await prisma.orderMeta.findFirst({
              where: { orderId: order.id, key: '_packeta_status_notified_code' }
            });
            if (existingNotified) {
              await prisma.orderMeta.update({
                where: { id: existingNotified.id },
                data: { value: String(status.code) }
              });
            } else {
              await prisma.orderMeta.create({
                data: {
                  orderId: order.id,
                  key: '_packeta_status_notified_code',
                  value: String(status.code)
                }
              });
            }
          } catch (err) {
            console.warn('[packeta status email] failed', err);
          }
        }

        if (
          billingEmail &&
          newStatus === OrderStatus.cancelled &&
          order.paymentMethod !== 'cod' &&
          new Date(order.createdAt) >= RETURN_NOTIFY_AFTER
        ) {
          const alreadyNotified = order.meta.find(m => m.key === '_return_notified_at');
          if (!alreadyNotified) {
            try {
              await sendReturnNoticeEmail(order as Prisma.OrderGetPayload<{ include: { items: true; addresses: true } }>, billingEmail);
              await prisma.orderMeta.create({
                data: {
                  orderId: order.id,
                  key: '_return_notified_at',
                  value: new Date().toISOString()
                }
              });
            } catch (err) {
              console.warn('[packeta return email] failed', err);
            }
          }
        }
      } catch (err) {
        console.warn(`[packeta sync] failed for order ${order.id}`, err);
      }
    }

    return NextResponse.json({ ok: true, checked: toCheck.length, updated });
  } catch (error) {
    console.error('[packeta sync] error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
