export function normalizePublicAssetUrl(url: string | null | undefined): string {
  const trimmed = url?.trim() || '';

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('cdn.gardenyx.eu/')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}
