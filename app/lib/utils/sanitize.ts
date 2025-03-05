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
  // Odstránenie všetkých medzier a nečíselných znakov okrem +
  const cleaned = input.replace(/[^\d+]/g, '');

  // Formátovanie podľa typu čísla
  if (cleaned.startsWith('+421')) {
    // Formát: +421 XXX XXX XXX
    if (cleaned.length >= 13) {
      return `+421 ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10, 13)}`.trim();
    }
  } else if (cleaned.startsWith('00421')) {
    // Konverzia 00421 na +421
    const withPlus = '+421' + cleaned.substring(5);
    if (withPlus.length >= 13) {
      return `+421 ${withPlus.substring(4, 7)} ${withPlus.substring(7, 10)} ${withPlus.substring(10, 13)}`.trim();
    }
  } else if (cleaned.startsWith('0')) {
    // Formát: 0XXX XXX XXX
    if (cleaned.length >= 10) {
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)}`.trim();
    }
  }

  // Ak nezodpovedá žiadnemu formátu, vrátime vyčistený vstup
  return cleaned;
}
