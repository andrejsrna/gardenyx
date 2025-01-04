import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string): boolean {
  // Basic validation - ensure token exists and has correct length
  return token?.length === 64;
} 