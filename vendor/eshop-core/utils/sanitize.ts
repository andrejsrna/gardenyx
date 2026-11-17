import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  // Remove any HTML tags and encode special characters
  const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
  return sanitized;
}

// Špeciálna funkcia pre sanitizáciu PSČ
export function sanitizePostcode(input: string): string {
  // Odstránenie medzier a sanitizácia
  return sanitizeInput(input.replace(/\s+/g, ''));
}

// Funkcia na formátovanie a sanitizáciu telefónneho čísla
export function sanitizePhone(input: string): string {
  if (!input) return '';

  // Remove spaces and keep only leading + and digits
  const cleaned = input.trim().replace(/[^\d+]/g, '').replace(/(?!^)[+]/g, '');

  if (!cleaned) return '';

  // Accept either:
  // - local SK input: 09xxxxxxxx / 9xxxxxxxx
  // - international: +421xxxxxxxxx / 00421xxxxxxxxx
  // and avoid producing "+4210..." (trunk prefix 0 should be dropped after country code).

  // Normalize 00 prefix to +
  if (cleaned.startsWith('00')) {
    return sanitizePhone(`+${cleaned.slice(2)}`);
  }

  // Already international
  if (cleaned.startsWith('+')) {
    let digits = cleaned.slice(1).replace(/\D/g, '');
    if (digits.startsWith('4210') && digits.length === 13) {
      digits = `421${digits.slice(4)}`;
    }
    return digits ? `+${digits}` : '';
  }

  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return '';

  // Keep partial local input as-is while the user is typing (avoid forcing "+" early).
  if (digits.startsWith('0') && digits.length < 10) {
    return digits;
  }

  // Local SK number with leading 0 (e.g. 0912345678) -> +421912345678
  if (digits.startsWith('0') && digits.length === 10) {
    return `+421${digits.slice(1)}`;
  }

  // Local SK number without leading 0 (e.g. 912345678) -> +421912345678
  if (digits.length === 9) {
    return `+421${digits}`;
  }

  // International typed without "+" (e.g. 421912345678 or 4210912345678)
  if (digits.startsWith('4210') && digits.length === 13) {
    return `+421${digits.slice(4)}`;
  }
  if (digits.startsWith('421') && digits.length === 12) {
    return `+${digits}`;
  }

  // Generic fallback: treat it as full international digits
  return `+${digits}`;
}
