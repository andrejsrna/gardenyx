import prisma from '@/app/lib/prisma';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { createPacketaPacketForOrder } from '@/app/lib/packeta';

export type FinalizeOrderOptions = {
  forceEmail?: boolean;
  forcePacketa?: boolean;
};

const nowIso = () => new Date().toISOString();
const nowMs = () => Date.now();

async function setMeta(orderId: string, key: string, value: string) {
  await prisma.orderMeta.upsert({
    where: { orderId_key: { orderId, key } },
    create: { orderId, key, value },
    update: { value },
  });
}

async function deleteMeta(orderId: string, keys: string[]) {
  await prisma.orderMeta.deleteMany({ where: { orderId, key: { in: keys } } });
}

function safeJson(value: unknown) {
  try {
    const text = JSON.stringify(value);
    return text.length > 2000 ? text.slice(0, 2000) + '…' : text;
  } catch {
    try {
      return String(value);
    } catch {
      return '[unserializable]';
    }
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetries<T>(fn: () => Promise<T>, attempts: number, delaysMs: number[]) {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = delaysMs[i] ?? delaysMs[delaysMs.length - 1] ?? 0;
      if (delay > 0) {
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

export async function finalizeOrder(orderId: string, opts?: FinalizeOrderOptions) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true, meta: true },
  });
  if (!order) throw new Error('Order not found');

  // Simple lock to avoid concurrent finalize attempts (best-effort).
  const lockUntilKey = '_finalize_lock_until';
  const lockVal = order.meta.find(m => m.key === lockUntilKey)?.value || null;
  const lockUntilMs = lockVal ? Number(lockVal) : 0;
  if (Number.isFinite(lockUntilMs) && lockUntilMs > nowMs()) {
    return { ok: true, skipped: true, reason: 'locked', lockUntilMs } as any;
  }
  // lock for 2 minutes
  await setMeta(orderId, lockUntilKey, String(nowMs() + 2 * 60 * 1000));

  const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email || null;

  // EMAIL
  const emailSentAt = order.meta.find(m => m.key === '_email_sent_at')?.value || null;
  if ((opts?.forceEmail || !emailSentAt) && billingEmail) {
    try {
      await sendOrderConfirmationEmail(order as any, billingEmail);
      await sendOrderNotificationToAdmin(order as any, billingEmail);
      await setMeta(orderId, '_email_sent_at', nowIso());
    } catch (err) {
      const anyErr = err as any;
      const msg = err instanceof Error ? (err.message || '') : String(err);
      const status = anyErr?.response?.status;
      const data = anyErr?.response?.data;
      const detail = [
        msg,
        status ? `status=${status}` : null,
        data ? `data=${safeJson(data)}` : null
      ].filter(Boolean).join(' | ');

      await setMeta(orderId, '_email_error', detail);
      await setMeta(orderId, '_email_error_at', nowIso());
    }
  }

  // PACKETA
  const needsPacketa = order.shippingMethod === 'packeta_home' || order.shippingMethod === 'packeta_pickup';
  const packetaPacketId = order.meta.find(m => m.key === '_packeta_packet_id')?.value || null;

  if (needsPacketa && (opts?.forcePacketa || !packetaPacketId)) {
    try {
      const res = await withRetries(
        () => createPacketaPacketForOrder(orderId, { force: !!opts?.forcePacketa }),
        3,
        [0, 1500, 6000]
      );
      await deleteMeta(orderId, ['_packeta_error', '_packeta_error_at']);
      await setMeta(orderId, '_packeta_created_at', nowIso());
      await deleteMeta(orderId, [lockUntilKey]);
      return { ok: true, email: billingEmail, packeta: res };
    } catch (err) {
      const anyErr = err as any;
      const msg = err instanceof Error ? (err.message || '') : String(err);
      const causeCode = anyErr?.cause?.code;
      const causeMsg = anyErr?.cause?.message;
      const detail = [
        msg,
        causeCode ? `cause=${causeCode}` : null,
        causeMsg ? `causeMsg=${causeMsg}` : null
      ].filter(Boolean).join(' | ');

      await setMeta(orderId, '_packeta_error', detail);
      await setMeta(orderId, '_packeta_error_at', nowIso());
      await deleteMeta(orderId, [lockUntilKey]);
      return { ok: false, email: billingEmail, packetaError: detail };
    }
  }

  await deleteMeta(orderId, [lockUntilKey]);
  return { ok: true, email: billingEmail };
}
