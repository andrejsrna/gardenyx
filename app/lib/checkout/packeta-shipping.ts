import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import {
  FALLBACK_WEIGHT_KG,
  getPacketaShippingQuote as quote,
  roundMoney,
  unitWeightOrFallback,
  type PacketaShippingQuote,
  type ShippingLineItem,
} from '@eshop-core/packeta/pricing';

export { PACKETA_MAX_WEIGHT_KG } from '@eshop-core/packeta/pricing';
export type { PacketaShippingQuote, ShippingLineItem };

type StoredVariant = { id?: number; weight?: number | null; sku?: unknown };

/** Unit weights (variant weight first, then product) for the cart; `null` for unknown products. */
async function unitWeights(items: ShippingLineItem[]) {
  const products = await prisma.product.findMany({
    where: { wcId: { in: Array.from(new Set(items.map((item) => BigInt(item.productId)))) } },
    select: { wcId: true, weight: true, variants: true },
  });
  const productById = new Map(products.map((product) => [product.wcId.toString(), product]));
  return items.map((item) => {
    const product = productById.get(String(item.productId));
    if (!product) return null;
    const variants = Array.isArray(product.variants) ? product.variants as StoredVariant[] : [];
    const variant = item.variationId
      ? variants.find((candidate) => Number(candidate.id) === Number(item.variationId))
      : variants.find((candidate) => Boolean(item.sku) && String(candidate.sku || '') === item.sku);
    const rawWeight = variant?.weight ?? product.weight;
    return typeof rawWeight === 'object' && rawWeight && 'toNumber' in rawWeight
      ? (rawWeight as Prisma.Decimal).toNumber()
      : Number(rawWeight);
  });
}

async function cartWeightKg(items: ShippingLineItem[]) {
  const weights = await unitWeights(items);
  return items.reduce((sum, item, i) => {
    if (weights[i] === null) throw new Error(`Product ${item.productId} not found`);
    const label = `product ${item.productId}${item.variationId ? ` variant ${item.variationId}` : ''}`;
    return sum + unitWeightOrFallback(weights[i], label) * item.quantity;
  }, 0);
}

export async function getPacketaShippingQuote(
  items: ShippingLineItem[],
  shippingMethod: string,
  paymentMethod?: string,
): Promise<PacketaShippingQuote> {
  if (shippingMethod === 'personal_pickup') {
    return { weightKg: 0, basePrice: 0, fuelSurcharge: 0, tollSurcharge: 0, codFee: 0, totalNet: 0 };
  }
  return quote(items, shippingMethod, paymentMethod, cartWeightKg);
}

/** Cart weight for the overweight warning; unknown products are skipped. */
export async function getCartWeightKg(items: ShippingLineItem[]): Promise<number> {
  const validItems = items.filter((item) => Number.isFinite(item.productId) && item.quantity > 0);
  if (!validItems.length) return 0;
  const weights = await unitWeights(validItems);
  const weightKg = validItems.reduce((sum, item, i) => {
    const weight = weights[i];
    if (weight === null) return sum;
    return sum + (Number.isFinite(weight) && weight > 0 ? weight : FALLBACK_WEIGHT_KG) * item.quantity;
  }, 0);
  return roundMoney(weightKg);
}
