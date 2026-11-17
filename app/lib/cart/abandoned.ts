import { createAbandonedCart, type AbandonedItem } from '@eshop-core/cart/abandoned';
import prisma from '@/app/lib/prisma';
import { getProductsByIds } from '@/app/lib/products';
import { sendAbandonedCartEmail } from '@/app/lib/email/abandoned-cart';

export const ABANDONED_LOCALES = ['sk', 'en', 'hu'] as const;
export type AbandonedLocale = (typeof ABANDONED_LOCALES)[number];

/** Prices items against published products and variants; cart lines in the CartContext localStorage shape. */
async function resolveItems(items: AbandonedItem[], locale: AbandonedLocale) {
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

export const abandonedCart = createAbandonedCart({
  db: prisma.abandonedCart,
  locales: ABANDONED_LOCALES,
  resolveItems,
  sendReminder: ({ to, token, locale, items }) => sendAbandonedCartEmail({ to, token, locale, items }),
  hasOrderedSince: async (email, since) =>
    Boolean(await prisma.orderAddress.findFirst({
      where: { type: 'BILLING', email: { equals: email, mode: 'insensitive' }, order: { createdAt: { gte: since } } },
      select: { id: true },
    })),
  isUnsubscribed: async email =>
    Boolean(await prisma.newsletterSubscriber.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, status: 'unsubscribed' },
      select: { id: true },
    })),
});
