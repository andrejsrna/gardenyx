import crypto from 'crypto';

// Reuses the same secret as the session config so we don't need a new env var.
const rawSecret = process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long';
const PREVIEW_SECRET = crypto.createHash('sha256').update(`${rawSecret}:article-preview`).digest();

/**
 * Signed preview token bound to an article's id + updatedAt timestamp.
 * The token becomes invalid automatically whenever the article is edited
 * again (updatedAt changes), so stale preview links can't leak a newer draft
 * and don't need a DB-backed expiry/revocation table.
 */
export function generatePreviewToken(articleId: string, updatedAt: Date): string {
  const payload = `${articleId}:${updatedAt.getTime()}`;
  return crypto.createHmac('sha256', PREVIEW_SECRET).update(payload).digest('hex');
}

export function verifyPreviewToken(articleId: string, updatedAt: Date, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = generatePreviewToken(articleId, updatedAt);
  const expectedBuf = Buffer.from(expected, 'hex');
  const tokenBuf = Buffer.from(token, 'hex');
  if (expectedBuf.length !== tokenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, tokenBuf);
}
