import { randomBytes } from 'crypto';
import prisma from '@/app/lib/prisma';
import { getProductsByIds } from '@/app/lib/products';

const MAX_LINES = 20;
const MAX_QTY = 50;
/** One reminder per e-mail per this period, even if the customer abandons again. */
const REARM_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
export const ABANDONED_LOCALES = ['sk', 'en', 'hu'] as const;
export type AbandonedLocale = (typeof ABANDONED_LOCALES)[number];

export type AbandonedItem = { id: number; variationId?: number; quantity: number };

export function normalizeLocale(value: unknown): AbandonedLocale {
  return ABANDONED_LOCALES.includes(value as AbandonedLocale) ? (value as AbandonedLocale) : 'sk';
}

/** Shape-only cleanup; prices and existence are checked against the DB in priceItems. */
export function sanitizeItems(raw: unknown): AbandonedItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, AbandonedItem>();
  for (const entry of raw.slice(0, MAX_LINES)) {
    const id = Number((entry as { id?: unknown })?.id);
    const variation = Number((entry as { variationId?: unknown })?.variationId);
    const quantity = Math.floor(Number((entry as { quantity?: unknown })?.quantity));
    if (!Number.isSafeInteger(id) || id <= 0 || !(quantity > 0)) continue;
    const variationId = Number.isSafeInteger(variation) && variation > 0 ? variation : undefined;
    const key = `${id}:${variationId ?? ''}`;
    const prev = merged.get(key)?.quantity ?? 0;
    merged.set(key, { id, ...(variationId ? { variationId } : {}), quantity: Math.min(MAX_QTY, prev + quantity) });
  }
  return [...merged.values()];
}

/** Resolves items against published products; unknown products/variants are dropped. */
export async function resolveItems(items: AbandonedItem[], locale: AbandonedLocale) {
  const products = await getProductsByIds([...new Set(items.map(i => i.id))], locale);
  return items.flatMap(item => {
    const product = products.find(p => p.id === item.id && p.status === 'publish');
    if (!product) return [];
    const variant = item.variationId ? product.variants?.find(v => v.id === item.variationId) : undefined;
    if (item.variationId && !variant) return [];
    const price = variant?.price ?? Number(product.price);
    if (!Number.isFinite(price) || price <= 0) return [];
    return [{
      id: product.id,
      ...(variant ? { variationId: variant.id } : {}),
      name: variant ? `${product.name} – ${variant.name}` : product.name,
      price,
      quantity: item.quantity,
      image: product.images[0]?.src || '',
      sku: variant?.sku ?? product.sku ?? undefined,
      slug: product.slug,
    }];
  });
}

export async function saveAbandonedCart(email: string, rawItems: AbandonedItem[], locale: AbandonedLocale) {
  const resolved = await resolveItems(rawItems, locale);
  if (!resolved.length) return false;
  const items = resolved.map(({ id, variationId, quantity }) => ({ id, ...(variationId ? { variationId } : {}), quantity }));
  const total = Math.round(resolved.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;

  const existing = await prisma.abandonedCart.findUnique({ where: { email } });
  if (!existing) {
    await prisma.abandonedCart.create({ data: { email, items, total, locale, token: randomBytes(24).toString('base64url') } });
    return true;
  }
  if (existing.optedOutAt) return true;
  const rearm = existing.remindedAt && Date.now() - existing.remindedAt.getTime() > REARM_AFTER_MS;
  await prisma.abandonedCart.update({
    where: { email },
    data: { items, total, locale, ...(rearm ? { remindedAt: null } : {}) },
  });
  return true;
}
