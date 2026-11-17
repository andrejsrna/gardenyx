import prisma from '@/app/lib/prisma';
import { sendAbandonedCartEmail } from '@/app/lib/email/abandoned-cart';
import { normalizeLocale, resolveItems, sanitizeItems } from './abandoned';

const DELAY_MS = 60 * 60 * 1000;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const BATCH = 25;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** Sends ONE reminder for carts idle 1-48 h, unless the customer ordered or unsubscribed. */
export async function runAbandonedCartJob() {
  const now = Date.now();
  // Opted-out rows stay as a suppression list; everything else is kept 30 days (privacy policy).
  const purged = await prisma.abandonedCart.deleteMany({
    where: { optedOutAt: null, updatedAt: { lt: new Date(now - RETENTION_MS) } },
  });
  const carts = await prisma.abandonedCart.findMany({
    where: {
      remindedAt: null,
      optedOutAt: null,
      updatedAt: { lte: new Date(now - DELAY_MS), gte: new Date(now - MAX_AGE_MS) },
    },
    orderBy: { updatedAt: 'asc' },
    take: BATCH,
  });

  let sent = 0;
  let skippedOrdered = 0;
  let skippedOther = 0;
  for (const cart of carts) {
    const [ordered, unsubscribed] = await Promise.all([
      prisma.orderAddress.findFirst({
        where: {
          type: 'BILLING',
          email: { equals: cart.email, mode: 'insensitive' },
          order: { createdAt: { gte: new Date(cart.updatedAt.getTime() - DELAY_MS) } },
        },
        select: { id: true },
      }),
      prisma.newsletterSubscriber.findFirst({
        where: { email: { equals: cart.email, mode: 'insensitive' }, status: 'unsubscribed' },
        select: { id: true },
      }),
    ]);

    // Claim first so a parallel run or a crash never e-mails the same cart twice.
    const claimed = await prisma.abandonedCart.updateMany({
      where: { id: cart.id, remindedAt: null },
      data: { remindedAt: new Date() },
    });
    if (!claimed.count) continue;
    if (ordered) { skippedOrdered++; continue; }
    if (unsubscribed) { skippedOther++; continue; }

    const locale = normalizeLocale(cart.locale);
    const items = await resolveItems(sanitizeItems(cart.items), locale);
    if (!items.length) { skippedOther++; continue; }

    try {
      await sendAbandonedCartEmail({ to: cart.email, token: cart.token, locale, items });
      sent++;
    } catch (error) {
      console.error('[abandoned-cart] send failed', error);
      await prisma.abandonedCart.update({ where: { id: cart.id }, data: { remindedAt: null } });
    }
  }

  return { status: 'ok', targeted: carts.length, sent, skippedOrdered, skippedOther, purged: purged.count };
}
