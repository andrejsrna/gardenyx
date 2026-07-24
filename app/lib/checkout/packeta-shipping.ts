import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';

// Packeta SK price list, effective 2026-07-01. Prices are for Z-POINT submission,
// excluding VAT. Source: https://files.packeta.com/web/files/Kompletny_cennik_sluzieb.pdf
const FUEL_SURCHARGE_RATE = 0.155;
const TOLL_PER_STARTED_KG = 0.04;
const COD_FEE = 1;

const PICKUP_TIERS = [
  { maxKg: 5, price: 2.7 },
  { maxKg: 10, price: 4.2 },
  { maxKg: 15, price: 4.7 },
] as const;

const HOME_TIERS = [
  { maxKg: 1, price: 4 },
  { maxKg: 2, price: 4.55 },
  { maxKg: 5, price: 4.75 },
  { maxKg: 10, price: 6.12 },
  { maxKg: 15, price: 7.25 },
] as const;

export type ShippingLineItem = {
  productId: number;
  variationId?: number | null;
  sku?: string | null;
  quantity: number;
};

export type PacketaShippingQuote = {
  weightKg: number;
  basePrice: number;
  fuelSurcharge: number;
  tollSurcharge: number;
  codFee: number;
  totalNet: number;
};

type StoredVariant = { id?: number; weight?: number | null };

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getPacketaShippingQuote(
  items: ShippingLineItem[],
  shippingMethod: string,
  paymentMethod?: string,
): Promise<PacketaShippingQuote> {
  if (shippingMethod === 'personal_pickup') {
    return { weightKg: 0, basePrice: 0, fuelSurcharge: 0, tollSurcharge: 0, codFee: 0, totalNet: 0 };
  }
  if (shippingMethod !== 'packeta_pickup' && shippingMethod !== 'packeta_home') {
    throw new Error('Unsupported shipping method');
  }

  const validItems = items.filter((item) => Number.isFinite(item.productId) && item.quantity > 0);
  if (!validItems.length) throw new Error('Cart is empty');

  const products = await prisma.product.findMany({
    where: { wcId: { in: Array.from(new Set(validItems.map((item) => BigInt(item.productId)))) } },
    select: { wcId: true, weight: true, variants: true },
  });
  type ShippingProduct = typeof products[number];
  const productById = new Map<string, ShippingProduct>(products.map((product) => [product.wcId.toString(), product]));

  let weightKg = 0;
  for (const item of validItems) {
    const product = productById.get(String(item.productId));
    if (!product) throw new Error(`Product ${item.productId} not found`);

    const variants = Array.isArray(product.variants) ? product.variants as StoredVariant[] : [];
    const variant = item.variationId
      ? variants.find((candidate) => Number(candidate.id) === Number(item.variationId))
      : variants.find((candidate) => Boolean(item.sku) && String((candidate as { sku?: unknown }).sku || '') === item.sku);
    const rawWeight = variant?.weight ?? product.weight;
    const unitWeight = typeof rawWeight === 'object' && rawWeight && 'toNumber' in rawWeight
      ? (rawWeight as Prisma.Decimal).toNumber()
      : Number(rawWeight);

    if (!Number.isFinite(unitWeight) || unitWeight <= 0) {
      throw new Error(`Missing shipping weight for product ${item.productId}${item.variationId ? ` variant ${item.variationId}` : ''}`);
    }
    weightKg += unitWeight * item.quantity;
  }

  const tiers = shippingMethod === 'packeta_pickup' ? PICKUP_TIERS : HOME_TIERS;
  const tier = tiers.find((candidate) => weightKg <= candidate.maxKg);
  if (!tier) throw new Error(`Cart weight ${roundMoney(weightKg)} kg exceeds Packeta's 15 kg limit`);

  const basePrice = tier.price;
  const fuelSurcharge = roundMoney(basePrice * FUEL_SURCHARGE_RATE);
  const tollSurcharge = roundMoney(Math.ceil(weightKg) * TOLL_PER_STARTED_KG);
  const codFee = paymentMethod === 'cod' ? COD_FEE : 0;

  return {
    weightKg: roundMoney(weightKg),
    basePrice,
    fuelSurcharge,
    tollSurcharge,
    codFee,
    totalNet: roundMoney(basePrice + fuelSurcharge + tollSurcharge + codFee),
  };
}

export function getShippingNetFromQuote(quote: PacketaShippingQuote, freeShipping = false) {
  return freeShipping ? 0 : quote.totalNet;
}

export const PACKETA_PRICE_LIST_EFFECTIVE_FROM = '2026-07-01';
