export function normalizeFacebookPixelId(value: string | null | undefined): string {
  const trimmed = value?.trim() || '';

  return /^\d{5,30}$/.test(trimmed) ? trimmed : '';
}
