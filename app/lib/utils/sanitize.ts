import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  // Remove any HTML tags and encode special characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
} 