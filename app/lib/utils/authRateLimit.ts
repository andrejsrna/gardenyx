import { LRUCache } from 'lru-cache';

const loginAttempts = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60 * 15 // 15 minutes
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export function checkLoginAttempts(identifier: string): boolean {
  const attempts = loginAttempts.get(identifier) || 0;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lastAttempt = loginAttempts.get(`${identifier}_timestamp`);
    if (lastAttempt && Date.now() - lastAttempt < LOCKOUT_TIME) {
      return false;
    }
    loginAttempts.delete(identifier);
  }
  return true;
}

export function recordLoginAttempt(identifier: string): void {
  const attempts = loginAttempts.get(identifier) || 0;
  loginAttempts.set(identifier, attempts + 1);
  loginAttempts.set(`${identifier}_timestamp`, Date.now());
}

export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
} 