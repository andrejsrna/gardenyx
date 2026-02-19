-- Add unique constraint for OrderMeta(orderId, key)
-- This enables reliable upserts and prevents duplicate meta keys per order.

ALTER TABLE "nkv_admin"."OrderMeta"
ADD CONSTRAINT "OrderMeta_orderId_key_key" UNIQUE ("orderId", "key");
