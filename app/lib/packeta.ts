import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { PACKETA_HOME_CARRIER_IDS } from '@/app/lib/checkout/constants';
import { createPacketaPacketForOrder as createPacket, type PacketaResult, type PacketaShopConfig } from '@eshop-core/packeta/packet';

const DEFAULT_WEIGHT_KG = 0.5;

type OrderItemWithProduct = {
  productId: bigint;
  variationId: bigint | null;
  quantity: number;
};

/**
 * Calculate total weight for order items by looking up actual product/variant
 * weights from the database. Falls back to DEFAULT_WEIGHT_KG per item if no
 * weight is set on the product or variant.
 */
async function calculateTotalWeight(items: OrderItemWithProduct[]): Promise<number> {
  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  if (productIds.length === 0) return 0;

  const products = await prisma.product.findMany({
    where: { wcId: { in: productIds } },
    select: { wcId: true, weight: true, variants: true },
  });

  const productMap = new Map<string, { weight: Prisma.Decimal | null; variants: unknown }>();
  for (const p of products) {
    productMap.set(p.wcId.toString(), p);
  }

  let total = 0;
  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    let itemWeight: number | null = null;

    if (product && item.variationId) {
      // Try to find weight in the specific variant
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const variant = variants.find(
        (v: Record<string, unknown>) => typeof v === 'object' && v !== null && Number(v.id) === Number(item.variationId),
      ) as Record<string, unknown> | undefined;
      if (variant && typeof variant.weight === 'number' && Number.isFinite(variant.weight)) {
        itemWeight = variant.weight;
      }
    }

    if (itemWeight === null && product?.weight) {
      // Use product-level weight
      const w = product.weight;
      itemWeight = typeof w === 'object' && 'toNumber' in w ? w.toNumber() : Number(w);
      if (!Number.isFinite(itemWeight)) itemWeight = null;
    }

    total += (itemWeight ?? DEFAULT_WEIGHT_KG) * item.quantity;
  }

  return total;
}

const config: PacketaShopConfig = {
  db: prisma,
  // Sent as `eshop_id` since launch; keep it until the sender setup in client.packeta.com is checked.
  senderAttributes: { eshop_id: process.env.PACKETA_ESHOP_ID || 'FITDOPLNKY' },
  homeCarrierIds: PACKETA_HOME_CARRIER_IDS,
  homeCountryCase: 'lower',
  weightKg: items => calculateTotalWeight(items.map(item => ({ productId: BigInt(item.productId), variationId: item.variationId == null ? null : BigInt(item.variationId), quantity: item.quantity }))),
};

export type { PacketaResult };

export const createPacketaPacketForOrder = (orderId: string, opts?: { force?: boolean }) => createPacket(config, orderId, opts);
