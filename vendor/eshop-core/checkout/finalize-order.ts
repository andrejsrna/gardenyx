export type FinalizeOrderOptions = {
  /** Force sending customer+admin emails even if _email_sent_at exists. */
  forceEmail?: boolean;
  /** Force recreating Packeta packet even if _packeta_packet_id exists. */
  forcePacketa?: boolean;
  /** Whether finalizeOrder is allowed to send customer/admin emails. */
  allowCustomerEmail?: boolean;
};

type FinalizableOrder = {
  shippingMethod: string | null;
  meta: Array<{ key: string; value: string | null }>;
  addresses: Array<{ type: string; email?: string | null }>;
};

/** Subset of the Prisma client used here (pass `prisma`). */
export interface FinalizeOrderDb<O extends FinalizableOrder> {
  order: {
    findUnique(args: { where: { id: string }; include: { items: true; addresses: true; meta: true } }): PromiseLike<O | null>;
  };
  orderMeta: {
    upsert(args: {
      where: { orderId_key: { orderId: string; key: string } };
      create: { orderId: string; key: string; value: string };
      update: { value: string };
    }): PromiseLike<unknown>;
    deleteMany(args: { where: { orderId: string; key: { in: string[] } } }): PromiseLike<unknown>;
  };
}

export type FinalizeOrderConfig<O extends FinalizableOrder, P> = {
  db: FinalizeOrderDb<O>;
  /** Customer confirmation + admin notification. */
  sendOrderEmails(order: O, billingEmail: string): Promise<unknown>;
  createPacketaPacket(orderId: string, opts: { force: boolean }): Promise<P>;
};

type ErrorWithContext = Error & {
  response?: { status?: number; data?: unknown };
  cause?: { code?: string; message?: string };
};

const nowIso = () => new Date().toISOString();

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

async function withRetries<T>(fn: () => Promise<T>, delaysMs: number[]) {
  let lastErr: unknown;
  for (const delay of delaysMs) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/**
 * Post-payment order finalization: confirmation e-mails (once) and the Packeta packet (once, with
 * retries), with a 2-minute best-effort lock and errors recorded in order meta for the admin/cron.
 */
export function createFinalizeOrder<O extends FinalizableOrder, P>(config: FinalizeOrderConfig<O, P>) {
  const { db } = config;
  const setMeta = (orderId: string, key: string, value: string) =>
    db.orderMeta.upsert({ where: { orderId_key: { orderId, key } }, create: { orderId, key, value }, update: { value } });
  const deleteMeta = (orderId: string, keys: string[]) => db.orderMeta.deleteMany({ where: { orderId, key: { in: keys } } });

  return async function finalizeOrder(orderId: string, opts?: FinalizeOrderOptions) {
    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, addresses: true, meta: true } });
    if (!order) throw new Error('Order not found');

    const lockUntilKey = '_finalize_lock_until';
    const lockVal = order.meta.find(m => m.key === lockUntilKey)?.value || null;
    const lockUntilMs = lockVal ? Number(lockVal) : 0;
    if (Number.isFinite(lockUntilMs) && lockUntilMs > Date.now()) {
      return { ok: true, skipped: true, reason: 'locked' as const, lockUntilMs };
    }
    await setMeta(orderId, lockUntilKey, String(Date.now() + 2 * 60 * 1000));

    const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email || null;

    // EMAIL
    const emailSentAt = order.meta.find(m => m.key === '_email_sent_at')?.value || null;
    if (opts?.allowCustomerEmail === false) {
      // avoid spam from automated retries (cron)
      if (!emailSentAt) {
        await setMeta(orderId, '_email_skipped_reason', 'disabled');
        await setMeta(orderId, '_email_skipped_at', nowIso());
      }
    } else if ((opts?.forceEmail || !emailSentAt) && billingEmail) {
      try {
        await config.sendOrderEmails(order, billingEmail);
        await setMeta(orderId, '_email_sent_at', nowIso());
        await deleteMeta(orderId, ['_email_error', '_email_error_at', '_email_skipped_reason', '_email_skipped_at']);
      } catch (err) {
        const e = err as ErrorWithContext;
        const msg = err instanceof Error ? (err.message || '') : String(err);
        const status = e.response?.status;
        const data = e.response?.data;
        const detail = [msg, status ? `status=${status}` : null, data ? `data=${safeJson(data)}` : null].filter(Boolean).join(' | ');
        await setMeta(orderId, '_email_error', detail);
        await setMeta(orderId, '_email_error_at', nowIso());
      }
    }

    // PACKETA
    const needsPacketa = order.shippingMethod === 'packeta_home' || order.shippingMethod === 'packeta_pickup';
    const packetaPacketId = order.meta.find(m => m.key === '_packeta_packet_id')?.value || null;

    if (needsPacketa && (opts?.forcePacketa || !packetaPacketId)) {
      try {
        const res = await withRetries(() => config.createPacketaPacket(orderId, { force: !!opts?.forcePacketa }), [0, 1500, 6000]);
        await deleteMeta(orderId, ['_packeta_error', '_packeta_error_at']);
        await setMeta(orderId, '_packeta_created_at', nowIso());
        await deleteMeta(orderId, [lockUntilKey]);
        return { ok: true, email: billingEmail, packeta: res };
      } catch (err) {
        const e = err as ErrorWithContext;
        const msg = err instanceof Error ? (err.message || '') : String(err);
        const causeCode = e.cause?.code;
        const causeMsg = e.cause?.message;
        const detail = [msg, causeCode ? `cause=${causeCode}` : null, causeMsg ? `causeMsg=${causeMsg}` : null].filter(Boolean).join(' | ');
        await setMeta(orderId, '_packeta_error', detail);
        await setMeta(orderId, '_packeta_error_at', nowIso());
        await deleteMeta(orderId, [lockUntilKey]);
        return { ok: false, email: billingEmail, packetaError: detail };
      }
    }

    await deleteMeta(orderId, [lockUntilKey]);
    return { ok: true, email: billingEmail };
  };
}
