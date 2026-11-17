import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { getSiteUrl } from '../automation/config';
import { emailButton, renderEmail } from './template';
import type { AbandonedLocale } from '../cart/abandoned';

type Line = { name: string; price: number; quantity: number };

const TEXT: Record<AbandonedLocale, {
  subject: string; title: string; preheader: string; intro: string; cta: string; total: string; footer: string; optOut: string;
}> = {
  sk: {
    subject: 'Váš košík na vás čaká',
    title: 'Nezabudli ste na niečo?',
    preheader: 'Produkty v košíku sme vám odložili.',
    intro: 'Dobrý deň, všimli sme si, že ste objednávku nedokončili. Produkty sme vám uložili, objednávku dokončíte jedným kliknutím.',
    cta: 'Dokončiť objednávku',
    total: 'Spolu',
    footer: 'Pripomienku posielame iba raz. Ak ste už objednali alebo nákup neplánujete, e-mail pokojne ignorujte.',
    optOut: 'Neposielať pripomienky košíka',
  },
  en: {
    subject: 'Your cart is waiting for you',
    title: 'Did you forget something?',
    preheader: 'We saved the products in your cart.',
    intro: 'Hello, we noticed you did not finish your order. We saved your products, so you can complete the order in one click.',
    cta: 'Complete my order',
    total: 'Total',
    footer: 'We send this reminder only once. If you have already ordered or do not plan to buy, just ignore this e-mail.',
    optOut: 'Stop cart reminders',
  },
  hu: {
    subject: 'A kosara már várja',
    title: 'Nem felejtett el valamit?',
    preheader: 'A kosarában lévő termékeket elmentettük.',
    intro: 'Jó napot! Észrevettük, hogy nem fejezte be a rendelést. A termékeket elmentettük, a rendelést egy kattintással befejezheti.',
    cta: 'Rendelés befejezése',
    total: 'Összesen',
    footer: 'Ezt az emlékeztetőt csak egyszer küldjük. Ha már rendelt, vagy nem tervez vásárolni, nyugodtan hagyja figyelmen kívül.',
    optOut: 'Ne küldjenek kosáremlékeztetőt',
  },
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;

export async function sendAbandonedCartEmail(params: { to: string; token: string; locale: AbandonedLocale; items: Line[] }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY missing');

  const text = TEXT[params.locale];
  const site = getSiteUrl();
  const restoreUrl = `${site}/${params.locale}/kosik/obnovit/${params.token}`;
  const optOutUrl = `${site}/api/cart/abandoned/odhlasit?token=${params.token}`;
  const total = params.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const rows = params.items.map(item => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;">${item.quantity}× ${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;text-align:right;white-space:nowrap;">${money(item.price * item.quantity)}</td>
        </tr>`).join('');

  const content = `
    <p style="margin:0 0 16px 0;color:#475569;">${text.intro}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;font-size:14px;">
      <tbody>${rows}
        <tr>
          <td style="padding:10px 0;font-weight:700;color:#0f172a;">${text.total}</td>
          <td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right;white-space:nowrap;">${money(total)}</td>
        </tr>
      </tbody>
    </table>
    ${emailButton({ label: text.cta, url: restoreUrl })}
  `;

  const email = new SendSmtpEmail();
  email.subject = text.subject;
  email.htmlContent = renderEmail({
    title: text.title,
    preheader: text.preheader,
    content,
    footerNote: `${text.footer} <a href="${optOutUrl}" style="color:#94a3b8;">${text.optOut}</a>`,
  });
  email.sender = {
    name: process.env.BREVO_SENDER_NAME || 'GardenYX',
    email: process.env.BREVO_SENDER_EMAIL || 'no-reply@gardenyx.eu',
  };
  email.to = [{ email: params.to }];

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return api.sendTransacEmail(email);
}
