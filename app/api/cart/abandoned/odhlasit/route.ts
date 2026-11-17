import prisma from '@/app/lib/prisma';
import { getSiteUrl } from '@/app/lib/automation/config';
import { normalizeLocale } from '@/app/lib/cart/abandoned';

const TEXT = {
  sk: ['Pripomienky košíka vypnuté', 'Pripomienky nedokončeného košíka vám už posielať nebudeme.', 'Späť do obchodu'],
  en: ['Cart reminders turned off', 'We will no longer send you reminders about unfinished carts.', 'Back to the shop'],
  hu: ['Kosáremlékeztetők kikapcsolva', 'Többé nem küldünk emlékeztetőt a befejezetlen kosárról.', 'Vissza az áruházba'],
} as const;

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  const cart = token ? await prisma.abandonedCart.findUnique({ where: { token }, select: { id: true, locale: true } }) : null;
  if (cart) {
    await prisma.abandonedCart.updateMany({ where: { id: cart.id, optedOutAt: null }, data: { optedOutAt: new Date() } });
  }
  const locale = normalizeLocale(cart?.locale);
  const [title, body, back] = TEXT[locale];
  const html = `<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 20px;color:#0f172a"><h1 style="font-size:22px">${title}</h1><p>${body}</p><p><a href="${getSiteUrl()}/${locale}" style="color:#515a45">${back}</a></p></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
