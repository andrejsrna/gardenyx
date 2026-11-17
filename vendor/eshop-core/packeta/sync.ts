import { fetchPacketaStatus, mapPacketaStatusToOrderStatus, resolvePaymentStatusAfterDelivery } from './status';

type Meta = { id: string; key: string; value: string | null };
type Address = { type: string; email?: string | null };
export type PacketaSyncOrder = {
  id: string;
  status: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: Date;
  meta: Meta[];
  addresses: Address[];
};

type MetaWhere = { orderId: string; key: string };
type MetaDb = {
  findFirst(args: { where: MetaWhere }): PromiseLike<{ id: string } | null>;
  update(args: { where: { id: string }; data: { value: string } }): PromiseLike<unknown>;
  create(args: { data: { orderId: string; key: string; value: string } }): PromiseLike<unknown>;
};
export type PacketaSyncTx = { order: { update(args: OrderUpdate): PromiseLike<unknown> }; orderMeta: MetaDb };
type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'refunded' | 'failed';
type OrderUpdate = { where: { id: string }; data: { status: 'completed' | 'cancelled' | 'processing'; paymentStatus: PaymentStatus } };

/** Subset of the Prisma client used here (pass `prisma`). */
export interface PacketaSyncDb<O extends PacketaSyncOrder> {
  order: {
    findMany(args: {
      where: {
        id?: { in: string[] };
        meta: { some: { key: string } };
        status: { notIn: Array<'completed' | 'cancelled'> };
      };
      include: { meta: true; items: true; addresses: true };
    }): PromiseLike<O[]>;
  };
  orderMeta: MetaDb;
}

export type PacketaSyncHooks<O extends PacketaSyncOrder> = {
  db: PacketaSyncDb<O>;
  /** Runs `fn` in a DB transaction: `fn => prisma.$transaction(tx => fn(tx))`. */
  transaction(fn: (tx: PacketaSyncTx) => Promise<void>): PromiseLike<unknown>;
  /** Packet delivered (order completed): invoice + invoice e-mail. */
  onDelivered?(order: O, billingEmail: string | null): Promise<unknown>;
  /** Customer e-mail for a tracked status change (codes in `notifyCodes`), sent once per code. */
  onStatusNotify?(order: O, billingEmail: string, code: number, barcode: string | undefined): Promise<unknown>;
  /** Prepaid order came back (cancelled): return notice, sent once. */
  onReturned?(order: O, billingEmail: string): Promise<unknown>;
  /** Packeta codes that trigger `onStatusNotify` (default arrived, departed, ready for pickup). */
  notifyCodes?: number[];
  /** Orders older than this get no return notice (default 30 days ago). */
  returnNotifyAfter?: Date;
};

async function setMeta(db: MetaDb, orderId: string, key: string, value: string) {
  const existing = await db.findFirst({ where: { orderId, key } });
  if (existing) await db.update({ where: { id: existing.id }, data: { value } });
  else await db.create({ data: { orderId, key, value } });
}

/**
 * Pulls the Packeta status of every open order with a packet (or only `orderIds`), stores it on the
 * order and runs the shop hooks. Cron and the admin order list both call this, so a delivery seen
 * first by either one still produces the invoice and the e-mails.
 */
export async function syncPacketaStatuses<O extends PacketaSyncOrder>(hooks: PacketaSyncHooks<O>, orderIds?: string[]) {
  const { db } = hooks;
  const notifyCodes = new Set(hooks.notifyCodes ?? [2, 4, 5]);
  const returnNotifyAfter = hooks.returnNotifyAfter ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const orders = await db.order.findMany({
    where: {
      ...(orderIds ? { id: { in: orderIds } } : {}),
      meta: { some: { key: '_packeta_packet_id' } },
      status: { notIn: ['completed', 'cancelled'] },
    },
    include: { meta: true, items: true, addresses: true },
  });

  let updated = 0;
  for (const order of orders) {
    const meta = (key: string) => order.meta.find(m => m.key === key)?.value ?? undefined;
    const packetId = meta('_packeta_packet_id');
    if (!packetId) continue;
    const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email || null;
    try {
      const status = await fetchPacketaStatus(packetId);
      const newStatus = mapPacketaStatusToOrderStatus(status.code);
      await hooks.transaction(async tx => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus, paymentStatus: resolvePaymentStatusAfterDelivery(newStatus, order.paymentMethod, order.paymentStatus) },
        });
        await setMeta(tx.orderMeta, order.id, '_packeta_status_code', String(status.code));
        await setMeta(tx.orderMeta, order.id, '_packeta_status_text', status.text);
      });
      updated += 1;

      if (newStatus === 'completed' && hooks.onDelivered) {
        await hooks.onDelivered(order, billingEmail).catch(err => console.warn(`[packeta sync] delivered hook failed for ${order.id}`, err));
      }

      if (billingEmail && hooks.onStatusNotify && notifyCodes.has(status.code) && String(status.code) !== meta('_packeta_status_notified_code')) {
        try {
          await hooks.onStatusNotify(order, billingEmail, status.code, meta('_packeta_barcode'));
          await setMeta(db.orderMeta, order.id, '_packeta_status_notified_code', String(status.code));
        } catch (err) {
          console.warn('[packeta sync] status e-mail failed', err);
        }
      }

      if (
        billingEmail && hooks.onReturned && newStatus === 'cancelled' && order.paymentMethod !== 'cod'
        && new Date(order.createdAt) >= returnNotifyAfter && !meta('_return_notified_at')
      ) {
        try {
          await hooks.onReturned(order, billingEmail);
          await db.orderMeta.create({ data: { orderId: order.id, key: '_return_notified_at', value: new Date().toISOString() } });
        } catch (err) {
          console.warn('[packeta sync] return e-mail failed', err);
        }
      }
    } catch (err) {
      console.warn(`[packeta sync] failed for order ${order.id}`, err);
    }
  }
  return { checked: orders.length, updated };
}
