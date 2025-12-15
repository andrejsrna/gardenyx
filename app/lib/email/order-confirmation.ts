import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import type { Order, OrderItem, OrderAddress } from '@prisma/client';

type OrderWithRelations = Order & {
  items: OrderItem[];
  addresses: OrderAddress[];
};

const formatCurrency = (value: unknown) => {
  const num = typeof value === 'string' || typeof value === 'number'
    ? Number(value)
    : Number((value as { toString?: () => string })?.toString?.());
  if (!Number.isFinite(num)) return '';
  return `${num.toFixed(2)} €`;
};

const buildHtml = (order: OrderWithRelations, email: string) => {
  const billing = order.addresses.find(a => a.type === 'BILLING');
  const shipping = order.addresses.find(a => a.type === 'SHIPPING') || billing;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;">${item.productName}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;">${item.quantity}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price)}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  return `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 720px; margin:0 auto; padding:24px; color:#0f172a;">
    <h1 style="margin:0 0 12px 0;font-size:24px;font-weight:800;">Potvrdenie objednávky #${order.id}</h1>
    <p style="margin:0 0 16px 0;">Ďakujeme za objednávku. V prílohe nájdete rekapituláciu.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 16px 0;">
      <tr>
        <td style="padding:8px;background:#f1f5f9;border:1px solid #e2e8f0;">Spôsob platby</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${order.paymentMethod === 'cod' ? 'Dobierka' : 'Platba kartou'}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f1f5f9;border:1px solid #e2e8f0;">Doprava</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${order.shippingMethod || '—'}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f1f5f9;border:1px solid #e2e8f0;">Suma</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <h3 style="margin:16px 0 8px 0;">Položky</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:left;">Produkt</th>
          <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:left;">Množ.</th>
          <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">Cena</th>
          <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">Spolu</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <h3 style="margin:16px 0 8px 0;">Fakturačné údaje</h3>
    <p style="margin:0 0 4px 0;">${[billing?.firstName, billing?.lastName].filter(Boolean).join(' ')}</p>
    <p style="margin:0 0 4px 0;">${billing?.address1 || ''} ${billing?.address2 || ''}</p>
    <p style="margin:0 0 4px 0;">${billing?.postcode || ''} ${billing?.city || ''}</p>
    <p style="margin:0 0 4px 0;">${billing?.country || ''}</p>
    <p style="margin:0 0 4px 0;">${billing?.email || email}</p>
    <p style="margin:0 0 4px 0;">${billing?.phone || ''}</p>

    <h3 style="margin:16px 0 8px 0;">Dodacie údaje</h3>
    <p style="margin:0 0 4px 0;">${[shipping?.firstName, shipping?.lastName].filter(Boolean).join(' ')}</p>
    <p style="margin:0 0 4px 0;">${shipping?.address1 || ''} ${shipping?.address2 || ''}</p>
    <p style="margin:0 0 4px 0;">${shipping?.postcode || ''} ${shipping?.city || ''}</p>
    <p style="margin:0 0 4px 0;">${shipping?.country || ''}</p>
  </div>
`;
};

export async function sendOrderConfirmationEmail(order: OrderWithRelations, to: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !to) return;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const email = new SendSmtpEmail();
  email.subject = `Potvrdenie objednávky #${order.id}`;
  email.htmlContent = buildHtml(order, to);
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: to }];

  return api.sendTransacEmail(email);
}

export async function sendOrderNotificationToAdmin(order: OrderWithRelations, customerEmail?: string) {
  const adminEmail = process.env.ORDER_NOTIFY_EMAIL || 'info@fitdoplnky.sk';
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !adminEmail) return;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const email = new SendSmtpEmail();
  email.subject = `Nová objednávka #${order.id}`;
  email.htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin:0 auto; padding:24px; color:#0f172a;">
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:800;">Nová objednávka #${order.id}</h1>
      <p style="margin:0 0 12px 0;">Suma: ${formatCurrency(order.total)}</p>
      ${customerEmail ? `<p style="margin:0 0 12px 0;">Email zákazníka: ${customerEmail}</p>` : ''}
      <p style="margin:0;">Pozrite admin DB na detaily.</p>
    </div>
  `;
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: adminEmail }];

  return api.sendTransacEmail(email);
}

const statusTexts: Record<number, string> = {
  1: 'Zásielka vytvorená',
  2: 'Zásielka prijatá na depe',
  3: 'Pripravená na odoslanie',
  4: 'Na ceste',
  5: 'Pripravená na vyzdvihnutie',
  6: 'Predaná dopravcovi',
  7: 'Doručená',
  9: 'Na ceste späť',
  10: 'Vrátená',
  11: 'Zrušená',
  12: 'Zber na depe',
  14: 'Colné konanie',
  15: 'Reverse packet prijatý',
  16: 'Pokus o doručenie (home)',
  17: 'Odmietnutá (home)',
  18: 'Odmietnutá',
  19: 'Nedoručené (žiadna pobočka)',
  20: 'Uskladnenie expirovalo',
  21: 'Zrušené po podaní',
  22: 'Nesplňa podmienky (overlimit)',
  23: 'Pokus o doručenie do Z-BOXu',
  24: 'Posledný pokus o doručenie do Z-BOXu',
  25: 'Prvý pokus externého kuriéra',
  26: 'Preverovanie zásielky',
  27: 'Preverovanie ukončené',
  28: 'Presmerované na obľúbený bod',
  29: 'Presmerované mimo obľúbených bodov',
  30: 'Presmerované (bez obľúbeného bodu)',
  999: 'Neznámy stav'
};

export async function sendPacketaStatusEmail(order: OrderWithRelations, to: string, code: number, barcode?: string | null) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !to) return;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';
  const status = statusTexts[code] || `Status ${code}`;
  const trackingUrl = barcode ? `https://tracking.packeta.com/sk/?id=${barcode}` : null;

  const email = new SendSmtpEmail();
  email.subject = `Aktualizácia zásielky: ${status}`;
  email.htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin:0 auto; padding:24px; color:#0f172a;">
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:800;">Stav zásielky k objednávke #${order.id}</h1>
      <p style="margin:0 0 12px 0;">Aktuálny stav: <strong>${status}</strong></p>
      ${trackingUrl ? `<p style="margin:0 0 12px 0;">Sledovanie: <a href="${trackingUrl}">${trackingUrl}</a></p>` : ''}
      <p style="margin:0;">Ak máte otázky, odpovedzte na tento email.</p>
    </div>
  `;
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: to }];

  return api.sendTransacEmail(email);
}
