import { randomBytes } from 'crypto';

/**
 * Abandoned-cart reminders: the cart is stored when the customer types an e-mail at checkout,
 * a cron job sends ONE reminder 1-48 h later unless the customer ordered or unsubscribed, the
 * e-mail links back to a restore page (token in the path) and to an opt-out.
 *
 * Shop-specific parts (DB client, product lookup and pricing, e-mail template) come in through
 * the adapter; see createAbandonedCart.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export type AbandonedItem = { id: number; variationId?: number; quantity: number };

/** A priced cart line; shops may add fields (name, image, slug...) that their restore page stores. */
export type PricedLine = { id: number; variationId?: number; price: number; quantity: number };

export type AbandonedCartRow = {
  id: string;
  token: string;
  email: string;
  locale?: string | null;
  items: unknown;
  total: unknown;
  remindedAt: Date | null;
  optedOutAt: Date | null;
  updatedAt: Date;
};

/** The subset of the Prisma `abandonedCart` delegate the engine uses (methods => bivariant params). */
export interface AbandonedCartDb {
  findUnique(args: { where: { email: string } | { token: string } }): PromiseLike<AbandonedCartRow | null>;
  findMany(args: {
    where: { remindedAt: null; optedOutAt: null; updatedAt: { lte: Date; gte: Date } };
    orderBy: { updatedAt: 'asc' };
    take: number;
  }): PromiseLike<AbandonedCartRow[]>;
  create(args: { data: { email: string; token: string; items: AbandonedItem[]; total: number; locale?: string } }): PromiseLike<unknown>;
  update(args: {
    where: { email: string } | { id: string };
    data: { items?: AbandonedItem[]; total?: number; locale?: string; remindedAt?: Date | null };
  }): PromiseLike<unknown>;
  updateMany(args: {
    where: { id: string; remindedAt: null } | { token: string; optedOutAt: null };
    data: { remindedAt: Date } | { optedOutAt: Date };
  }): PromiseLike<{ count: number }>;
  deleteMany(args: { where: { optedOutAt: null; updatedAt: { lt: Date } } }): PromiseLike<{ count: number }>;
}

export type AbandonedCartAdapter<L extends string, Line extends PricedLine> = {
  db: AbandonedCartDb;
  /** First entry is the default. A single locale means the table has no `locale` column. */
  locales: readonly [L, ...L[]];
  /** Price items against the shop's catalogue; drop unknown/unpublished products and variants. */
  resolveItems(items: AbandonedItem[], locale: L): Promise<Line[]>;
  /** Defaults to sum(price * quantity); shops with bundle pricing override it. */
  cartTotal?(lines: Line[]): number;
  sendReminder(params: { to: string; token: string; locale: L; items: Line[]; total: number }): Promise<unknown>;
  hasOrderedSince(email: string, since: Date): Promise<boolean>;
  isUnsubscribed(email: string): Promise<boolean>;
  maxLines?: number;
  maxQuantity?: number;
  /** Reminder delay after the last cart change (default 1 h). */
  delayMs?: number;
  /** Carts older than this get no reminder (default 48 h). */
  maxAgeMs?: number;
  /** One reminder per e-mail per this period, even if the customer abandons again (default 30 days). */
  rearmAfterMs?: number;
  /** Rows (except opt-outs, kept as a suppression list) are deleted after this (default 30 days). */
  retentionMs?: number;
  batchSize?: number;
};

export type AbandonedCartJobResult = {
  status: 'ok';
  targeted: number;
  sent: number;
  skippedOrdered: number;
  skippedOther: number;
  failed: number;
  purged: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function createAbandonedCart<L extends string, Line extends PricedLine>(adapter: AbandonedCartAdapter<L, Line>) {
  const {
    db,
    locales,
    maxLines = 20,
    maxQuantity = 50,
    delayMs = HOUR,
    maxAgeMs = 48 * HOUR,
    rearmAfterMs = 30 * DAY,
    retentionMs = 30 * DAY,
    batchSize = 25,
  } = adapter;
  const persistLocale = locales.length > 1;
  const total = (lines: Line[]) =>
    Math.round((adapter.cartTotal ? adapter.cartTotal(lines) : lines.reduce((s, l) => s + l.price * l.quantity, 0)) * 100) / 100;

  function normalizeLocale(value: unknown): L {
    return locales.includes(value as L) ? (value as L) : locales[0];
  }

  /** Shape-only cleanup; existence and prices are checked by adapter.resolveItems. */
  function sanitizeItems(raw: unknown): AbandonedItem[] {
    if (!Array.isArray(raw)) return [];
    const merged = new Map<string, AbandonedItem>();
    for (const entry of raw.slice(0, maxLines)) {
      const id = Number((entry as { id?: unknown })?.id);
      const variation = Number((entry as { variationId?: unknown })?.variationId);
      const quantity = Math.floor(Number((entry as { quantity?: unknown })?.quantity));
      if (!Number.isSafeInteger(id) || id <= 0 || !(quantity > 0)) continue;
      const variationId = Number.isSafeInteger(variation) && variation > 0 ? variation : undefined;
      const key = `${id}:${variationId ?? ''}`;
      const prev = merged.get(key)?.quantity ?? 0;
      merged.set(key, { id, ...(variationId ? { variationId } : {}), quantity: Math.min(maxQuantity, prev + quantity) });
    }
    return [...merged.values()];
  }

  /** Parses a POST body `{ email, items, locale? }`; null when invalid. */
  function parseSaveRequest(body: unknown) {
    const b = (body ?? {}) as { email?: unknown; items?: unknown; locale?: unknown };
    const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
    const items = sanitizeItems(b.items);
    if (!EMAIL_RE.test(email) || email.length > 254 || items.length === 0) return null;
    return { email, items, locale: normalizeLocale(b.locale) };
  }

  /** Stores/updates the cart; false when nothing in it is purchasable. */
  async function save(email: string, rawItems: AbandonedItem[], locale: L = locales[0]) {
    const lines = await adapter.resolveItems(rawItems, locale);
    if (!lines.length) return false;
    const items = lines.map(({ id, variationId, quantity }) => ({ id, ...(variationId ? { variationId } : {}), quantity }));
    const data = { items, total: total(lines), ...(persistLocale ? { locale } : {}) };

    const existing = await db.findUnique({ where: { email } });
    if (!existing) {
      await db.create({ data: { email, token: randomBytes(24).toString('base64url'), ...data } });
      return true;
    }
    if (existing.optedOutAt) return true;
    const rearm = existing.remindedAt && Date.now() - existing.remindedAt.getTime() > rearmAfterMs;
    await db.update({ where: { email }, data: { ...data, ...(rearm ? { remindedAt: null } : {}) } });
    return true;
  }

  /** Priced lines for the restore page, or null for an unknown token. Never exposes the e-mail. */
  async function restore(token: string) {
    const cart = token ? await db.findUnique({ where: { token } }) : null;
    if (!cart) return null;
    return adapter.resolveItems(sanitizeItems(cart.items), normalizeLocale(cart.locale));
  }

  /** Marks the cart opted out; returns its locale (default for unknown tokens). */
  async function optOut(token: string): Promise<L> {
    if (!token) return locales[0];
    const cart = await db.findUnique({ where: { token } });
    if (cart) await db.updateMany({ where: { token, optedOutAt: null }, data: { optedOutAt: new Date() } });
    return normalizeLocale(cart?.locale);
  }

  async function runJob(): Promise<AbandonedCartJobResult> {
    const now = Date.now();
    const purged = await db.deleteMany({ where: { optedOutAt: null, updatedAt: { lt: new Date(now - retentionMs) } } });
    const carts = await db.findMany({
      where: { remindedAt: null, optedOutAt: null, updatedAt: { lte: new Date(now - delayMs), gte: new Date(now - maxAgeMs) } },
      orderBy: { updatedAt: 'asc' },
      take: batchSize,
    });

    const result: AbandonedCartJobResult = {
      status: 'ok', targeted: carts.length, sent: 0, skippedOrdered: 0, skippedOther: 0, failed: 0, purged: purged.count,
    };
    for (const cart of carts) {
      // Claim first so overlapping runs or a crash never e-mail the same cart twice.
      const claimed = await db.updateMany({ where: { id: cart.id, remindedAt: null }, data: { remindedAt: new Date() } });
      if (!claimed.count) continue;
      if (await adapter.hasOrderedSince(cart.email, new Date(cart.updatedAt.getTime() - delayMs))) { result.skippedOrdered++; continue; }
      if (await adapter.isUnsubscribed(cart.email)) { result.skippedOther++; continue; }

      const locale = normalizeLocale(cart.locale);
      const lines = await adapter.resolveItems(sanitizeItems(cart.items), locale);
      if (!lines.length) { result.skippedOther++; continue; }

      try {
        await adapter.sendReminder({ to: cart.email, token: cart.token, locale, items: lines, total: total(lines) });
        result.sent++;
      } catch (error) {
        console.error('[abandoned-cart] send failed', error);
        result.failed++;
        await db.update({ where: { id: cart.id }, data: { remindedAt: null } });
      }
    }
    return result;
  }

  return { normalizeLocale, sanitizeItems, parseSaveRequest, save, restore, optOut, runJob };
}
