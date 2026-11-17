// Packeta SK price list, effective 2026-07-01. Prices are for Z-POINT submission,
// excluding VAT. Source: https://files.packeta.com/web/files/Kompletny_cennik_sluzieb.pdf
export const PACKETA_PRICE_LIST_EFFECTIVE_FROM = '2026-07-01';
export const PACKETA_MAX_WEIGHT_KG = 15;
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

/** Used when a product has no weight. */
export const FALLBACK_WEIGHT_KG = 0.5;

export type PacketaShippingQuote = {
  weightKg: number;
  basePrice: number;
  fuelSurcharge: number;
  tollSurcharge: number;
  codFee: number;
  totalNet: number;
};

export type ShippingLineItem = {
  productId: number;
  variationId?: number | null;
  sku?: string | null;
  quantity: number;
};

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Positive finite weight, otherwise the fallback (with a warning naming `label`). */
export function unitWeightOrFallback(weight: unknown, label: string): number {
  const value = Number(weight);
  if (Number.isFinite(value) && value > 0) return value;
  console.warn(`Missing shipping weight for ${label} — using fallback ${FALLBACK_WEIGHT_KG} kg`);
  return FALLBACK_WEIGHT_KG;
}

/**
 * Net Packeta shipping price for a cart. The shop supplies `cartWeightKg` (product/variant weights,
 * `unitWeightOrFallback` for missing ones; throw for unknown products).
 */
export async function getPacketaShippingQuote(
  items: ShippingLineItem[],
  shippingMethod: string,
  paymentMethod: string | undefined,
  cartWeightKg: (items: ShippingLineItem[]) => Promise<number>,
): Promise<PacketaShippingQuote> {
  if (shippingMethod !== 'packeta_pickup' && shippingMethod !== 'packeta_home') {
    throw new Error('Unsupported shipping method');
  }
  const validItems = items.filter((item) => Number.isFinite(item.productId) && item.quantity > 0);
  if (!validItems.length) throw new Error('Cart is empty');
  const weightKg = await cartWeightKg(validItems);

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
