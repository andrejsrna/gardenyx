import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { rateLimit } from '@/app/lib/utils/rateLimit';
import { normalizeLocale, resolveItems, sanitizeItems, saveAbandonedCart } from '@/app/lib/cart/abandoned';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Stores the cart for a delayed reminder (sent by the `abandoned` cron job), never e-mails right away. */
export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
  try {
    await rateLimit(ip, 'newsletter');
  } catch {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const items = sanitizeItems(body?.items);
  if (!EMAIL_RE.test(email) || email.length > 254 || items.length === 0) {
    return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
  }

  const saved = await saveAbandonedCart(email, items, normalizeLocale(body?.locale));
  return saved ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
}

/** Restore link from the reminder e-mail: returns cart items for localStorage (never the e-mail). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  const cart = token ? await prisma.abandonedCart.findUnique({ where: { token } }) : null;
  if (!cart) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ items: await resolveItems(sanitizeItems(cart.items), normalizeLocale(cart.locale)) });
}
