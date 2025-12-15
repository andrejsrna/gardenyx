import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { sendPacketaStatusEmail } from '@/app/lib/email/order-confirmation';
import { fetchPacketaStatus, mapPacketaStatusToOrderStatus } from '@/app/lib/packeta-status';

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

const emailStatusCodes = new Set([2, 4, 5]);

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
              paymentStatus: newStatus === OrderStatus.completed ? PaymentStatus.paid : order.paymentStatus,
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
        if (billingEmail && emailStatusCodes.has(status.code)) {
          sendPacketaStatusEmail(order as Prisma.OrderGetPayload<{ include: { items: true; addresses: true } }>, billingEmail, status.code, barcode)
            .catch(err => console.warn('[packeta status email] failed', err));
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
