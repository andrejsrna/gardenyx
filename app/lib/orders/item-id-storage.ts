import type { Prisma } from '@prisma/client';

const MAX_LEGACY_ORDER_ITEM_ID = BigInt(2_147_483_647);
const LEGACY_ORDER_ITEM_ID_SPAN = MAX_LEGACY_ORDER_ITEM_ID - BigInt(1);

type OrderItemIdValue = bigint | number | string;

function toBigIntId(value: OrderItemIdValue): bigint {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  return BigInt(value);
}

function toLegacyIntegerId(value: bigint): number {
  const normalized = value < BigInt(0) ? -value : value;
  return Number((normalized % LEGACY_ORDER_ITEM_ID_SPAN) + BigInt(1));
}

function isJsonRecord(value: Prisma.InputJsonValue): value is Prisma.InputJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPrismaIntegerOverflowError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.toLowerCase().includes('value out of range for the type') ||
    message.toLowerCase().includes('out of range for type integer')
  );
}

export function getStoredOrderItemIds(
  productId: OrderItemIdValue,
  variationId?: OrderItemIdValue | null,
  useLegacyIntegerFallback = false
) {
  const normalizedProductId = toBigIntId(productId);
  const normalizedVariationId = variationId == null ? null : toBigIntId(variationId);

  return {
    productId: useLegacyIntegerFallback
      ? toLegacyIntegerId(normalizedProductId)
      : normalizedProductId,
    variationId: normalizedVariationId == null
      ? undefined
      : useLegacyIntegerFallback
        ? toLegacyIntegerId(normalizedVariationId)
        : normalizedVariationId,
    sourceProductId: normalizedProductId.toString(),
    sourceVariationId: normalizedVariationId?.toString(),
  };
}

export function withSourceOrderItemIdsInMeta(
  meta: Prisma.InputJsonValue | undefined,
  sourceIds: {
    productId: string;
    variationId?: string;
  }
): Prisma.InputJsonValue {
  const baseMeta = meta === undefined
    ? {}
    : isJsonRecord(meta)
      ? { ...meta }
      : { source_meta: meta };

  return {
    ...baseMeta,
    source_product_id: sourceIds.productId,
    ...(sourceIds.variationId ? { source_variation_id: sourceIds.variationId } : {}),
  };
}
