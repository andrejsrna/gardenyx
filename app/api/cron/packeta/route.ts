import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { Builder, Parser } from 'xml2js';
import { sendPacketaStatusEmail } from '@/app/lib/email/order-confirmation';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_KEY = process.env.PACKETA_API_SECRET || process.env.NEXT_PUBLIC_PACKETA_API_KEY;

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

const statusTextMap: Record<number, string> = {
  1: 'received data',
  2: 'arrived',
  3: 'prepared for departure',
  4: 'departed',
  5: 'ready for pickup',
  6: 'handed to carrier',
  7: 'delivered',
  9: 'posted back',
  10: 'returned',
  11: 'cancelled',
  12: 'collected',
  14: 'customs',
  15: 'reverse packet arrived',
  16: 'delivery attempt',
  17: 'rejected by recipient',
  18: 'rejected by recipient',
  19: 'return from hd no branch nearby',
  20: 'storage time expired',
  21: 'packet cancelled but consigned',
  22: 'return overlimit',
  23: 'zbox delivery attempt',
  24: 'zbox last delivery attempt',
  25: 'carrier first delivery attempt',
  26: 'packet under investigation',
  27: 'packet investigation resolved',
  28: 'favourite point redirect',
  29: 'no favourite point available redirect',
  30: 'no favourite point set redirect',
  999: 'unknown'
};

const emailStatusCodes = new Set([2, 4, 5]);

const mapOrderStatus = (code: number): OrderStatus => {
  if (code === 7) return OrderStatus.completed;
  if ([10, 11, 20, 21, 22].includes(code)) return OrderStatus.cancelled;
  return OrderStatus.processing;
};

async function fetchPacketaStatus(packetId: string): Promise<{ code: number; text: string }> {
  if (!PACKETA_API_KEY) throw new Error('Missing Packeta API key');

  const builder = new Builder({
    renderOpts: { pretty: false },
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });
  const xmlRequest = builder.buildObject({
    packetStatus: {
      apiPassword: PACKETA_API_KEY,
      packetId
    }
  });

  const response = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml'
    },
    body: xmlRequest
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Packeta status failed: ${response.statusText} ${responseText}`);
  }
  const parser = new Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(responseText) as { response?: { status?: string; result?: { statusCode?: string; codeText?: string } } };
  const code = Number(parsed?.response?.result?.statusCode || 999);
  const text = parsed?.response?.result?.codeText || statusTextMap[code] || 'unknown';
  return { code, text };
}

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
        const newStatus = mapOrderStatus(status.code);
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
