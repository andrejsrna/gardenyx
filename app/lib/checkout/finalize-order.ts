import prisma from '@/app/lib/prisma';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { createPacketaPacketForOrder } from '@/app/lib/packeta';

export type FinalizeOrderOptions = {
  forceEmail?: boolean;
  forcePacketa?: boolean;
};

const nowIso = () => new Date().toISOString();

async function setMeta(orderId: string, key: string, value: string) {
  await prisma.orderMeta.deleteMany({ where: { orderId, key } });
  await prisma.orderMeta.create({ data: { orderId, key, value } });
}

async function deleteMeta(orderId: string, keys: string[]) {
  await prisma.orderMeta.deleteMany({ where: { orderId, key: { in: keys } } });
}

export async function finalizeOrder(orderId: string, opts?: FinalizeOrderOptions) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true, meta: true },
  });
  if (!order) throw new Error('Order not found');

  const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email || null;

  // EMAIL
  const emailSentAt = order.meta.find(m => m.key === '_email_sent_at')?.value || null;
  if ((opts?.forceEmail || !emailSentAt) && billingEmail) {
    try {
      await sendOrderConfirmationEmail(order as any, billingEmail);
      await sendOrderNotificationToAdmin(order as any, billingEmail);
      await setMeta(orderId, '_email_sent_at', nowIso());
    } catch (err) {
      await setMeta(orderId, '_email_error', err instanceof Error ? err.message : String(err));
      await setMeta(orderId, '_email_error_at', nowIso());
    }
  }

  // PACKETA
  const needsPacketa = order.shippingMethod === 'packeta_home' || order.shippingMethod === 'packeta_pickup';
  const packetaPacketId = order.meta.find(m => m.key === '_packeta_packet_id')?.value || null;

  if (needsPacketa && (opts?.forcePacketa || !packetaPacketId)) {
    try {
      const res = await createPacketaPacketForOrder(orderId, { force: !!opts?.forcePacketa });
      await deleteMeta(orderId, ['_packeta_error', '_packeta_error_at']);
      await setMeta(orderId, '_packeta_created_at', nowIso());
      return { ok: true, email: billingEmail, packeta: res };
    } catch (err) {
      await setMeta(orderId, '_packeta_error', err instanceof Error ? err.message : String(err));
      await setMeta(orderId, '_packeta_error_at', nowIso());
      return { ok: false, email: billingEmail, packetaError: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ok: true, email: billingEmail };
}
