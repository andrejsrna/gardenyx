/**
 * Stripe metadata allows 500 characters per value (and 50 keys). Long values (base64 billing/
 * shipping data, meta_data with the Packeta point) are split into `key`, `key1`, `key2`, ...
 * and joined again in the webhook.
 */

const STRIPE_METADATA_VALUE_LIMIT = 500;

/** Writes the value, split over several keys when it exceeds the limit. */
export function setChunkedMeta(
  meta: Record<string, string>,
  key: string,
  value: string
): void {
  if (!value) {
    meta[key] = '';
    return;
  }
  if (value.length <= STRIPE_METADATA_VALUE_LIMIT) {
    meta[key] = value;
    return;
  }
  for (let i = 0, part = 0; i < value.length; i += STRIPE_METADATA_VALUE_LIMIT, part++) {
    const chunkKey = part === 0 ? key : `${key}${part}`;
    meta[chunkKey] = value.slice(i, i + STRIPE_METADATA_VALUE_LIMIT);
  }
}

/** Reads (and joins) a value written by setChunkedMeta. */
export function readChunkedMeta(
  meta: Record<string, string | undefined>,
  key: string
): string {
  let out = meta[key] || '';
  for (let part = 1; meta[`${key}${part}`] !== undefined; part++) {
    out += meta[`${key}${part}`];
  }
  return out;
}
