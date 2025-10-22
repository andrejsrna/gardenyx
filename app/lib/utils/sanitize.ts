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
  let cleaned = input.replace(/[^\d+]/g, '').replace(/(?!^)[+]/g, '');

  if (!cleaned) {
    return '';
  }

  // Handle Slovak numbers convenience
  if (cleaned.startsWith('00421')) {
    cleaned = '+421' + cleaned.substring(5);
  } else if (cleaned.startsWith('+421')) {
    cleaned = '+' + cleaned.substring(1).replace(/\D/g, '');
  } else if (cleaned.startsWith('0') && cleaned.length >= 9) {
    cleaned = '+421' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/\D/g, '');
  }

  // Ensure only digits after plus
  const normalized = '+' + cleaned.slice(1).replace(/\D/g, '');
  return normalized;
}
