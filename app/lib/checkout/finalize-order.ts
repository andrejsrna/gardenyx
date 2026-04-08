import type { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { createPacketaPacketForOrder } from '@/app/lib/packeta';

export type FinalizeOrderOptions = {
  /** Force sending customer+admin emails even if _email_sent_at exists. */
  forceEmail?: boolean;
  /** Force recreating Packeta packet even if _packeta_packet_id exists. */
  forcePacketa?: boolean;
  /** Whether finalizeOrder is allowed to send customer/admin emails. */
  allowCustomerEmail?: boolean;
};

const nowIso = () => new Date().toISOString();
const nowMs = () => Date.now();

type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; addresses: true; meta: true } }>;

type ErrorWithContext = Error & {
  response?: {
    status?: number;
    data?: unknown;
  };
  cause?: {
    code?: string;
    message?: string;
  };
};

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
    return { ok: true, skipped: true, reason: 'locked' as const, lockUntilMs };
  }
  // lock for 2 minutes
  await setMeta(orderId, lockUntilKey, String(nowMs() + 2 * 60 * 1000));

  const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email || null;

  // EMAIL
  const emailSentAt = order.meta.find(m => m.key === '_email_sent_at')?.value || null;
  const canEmail = opts?.allowCustomerEmail !== false;

  if (!canEmail) {
    // avoid spam from automated retries (cron)
    if (!emailSentAt) {
      await setMeta(orderId, '_email_skipped_reason', 'disabled');
      await setMeta(orderId, '_email_skipped_at', nowIso());
    }
  } else if ((opts?.forceEmail || !emailSentAt) && billingEmail) {
    try {
      await sendOrderConfirmationEmail(order as OrderWithRelations, billingEmail);
      await sendOrderNotificationToAdmin(order as OrderWithRelations, billingEmail);
      await setMeta(orderId, '_email_sent_at', nowIso());
      await deleteMeta(orderId, ['_email_error', '_email_error_at', '_email_skipped_reason', '_email_skipped_at']);
    } catch (err) {
      const errorWithContext = err as ErrorWithContext;
      const msg = err instanceof Error ? (err.message || '') : String(err);
      const status = errorWithContext.response?.status;
      const data = errorWithContext.response?.data;
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
      const errorWithContext = err as ErrorWithContext;
      const msg = err instanceof Error ? (err.message || '') : String(err);
      const causeCode = errorWithContext.cause?.code;
      const causeMsg = errorWithContext.cause?.message;
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
