const STRIPE_METADATA_VALUE_LIMIT = 500;

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
