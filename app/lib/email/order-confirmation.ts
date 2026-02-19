import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import type { Order, OrderItem, OrderAddress } from '@prisma/client';
import { renderEmail, keyValueTable, infoNote } from './template';

type OrderWithRelations = Order & {
  items: OrderItem[];
  addresses: OrderAddress[];
};

const getBrevoApiKey = () => process.env.BREVO_API_KEY?.trim().replace(/^['"]|['"]$/g, '');

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
      <td style="padding:8px;border:1px solid #e2e8f0;">${item.productName}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;">${item.quantity}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price)}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const summary = keyValueTable([
    { label: 'Spôsob platby', value: order.paymentMethod === 'cod' ? 'Dobierka' : 'Platba kartou' },
    { label: 'Doprava', value: order.shippingMethod || '—' },
    { label: 'Suma', value: formatCurrency(order.total) }
  ]);

  const addressesHtml = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 10px 0;">
      <tr>
        <td style="padding:10px;border:1px solid #e2e8f0;border-radius:12px 12px 0 0;background:#f8fafc;font-weight:700;">Fakturačné údaje</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #e2e8f0;border-top:0;color:#475569;">
          <p style="margin:0 0 4px 0;">${[billing?.firstName, billing?.lastName].filter(Boolean).join(' ')}</p>
          <p style="margin:0 0 4px 0;">${billing?.address1 || ''} ${billing?.address2 || ''}</p>
          <p style="margin:0 0 4px 0;">${billing?.postcode || ''} ${billing?.city || ''}</p>
          <p style="margin:0 0 4px 0;">${billing?.country || ''}</p>
          <p style="margin:0 0 4px 0;">${billing?.email || email}</p>
          <p style="margin:0 0 0 0;">${billing?.phone || ''}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:6px 0 0 0;">
      <tr>
        <td style="padding:10px;border:1px solid #e2e8f0;border-radius:12px 12px 0 0;background:#f8fafc;font-weight:700;">Dodacie údaje</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #e2e8f0;border-top:0;color:#475569;">
          <p style="margin:0 0 4px 0;">${[shipping?.firstName, shipping?.lastName].filter(Boolean).join(' ')}</p>
          <p style="margin:0 0 4px 0;">${shipping?.address1 || ''} ${shipping?.address2 || ''}</p>
          <p style="margin:0 0 4px 0;">${shipping?.postcode || ''} ${shipping?.city || ''}</p>
          <p style="margin:0 0 0 0;">${shipping?.country || ''}</p>
        </td>
      </tr>
    </table>
  `;

  const itemsTable = `
    <h3 style="margin:16px 0 8px 0;color:#0f172a;">Položky</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Produkt</th>
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Množ.</th>
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Cena</th>
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Spolu</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
  `;

  const content = `
    ${infoNote('Ďakujeme, že ste si vybrali naše produkty. Tu je prehľad vašej objednávky – nech máte všetko po ruke.')}
    ${summary}
    ${itemsTable}
    <h3 style="margin:18px 0 8px 0;color:#0f172a;">Adresy</h3>
    ${addressesHtml}
  `;

  const greeting = billing?.firstName ? `Ahoj ${billing.firstName},` : 'Ahoj,';

  return renderEmail({
    title: `Potvrdenie objednávky #${order.id}`,
    preheader: `Objednávka #${order.id} bola potvrdená.`,
    greeting,
    content,
    footerNote: 'Ak máte otázky alebo chcete niečo zmeniť, stačí odpovedať na tento email.'
  });
};

export async function sendOrderConfirmationEmail(order: OrderWithRelations, to: string) {
  const apiKey = getBrevoApiKey();
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
  const apiKey = getBrevoApiKey();
  if (!apiKey || !adminEmail) return;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const summary = keyValueTable([
    { label: 'Suma', value: formatCurrency(order.total) },
    { label: 'Spôsob platby', value: order.paymentMethod === 'cod' ? 'Dobierka' : 'Platba kartou' },
    { label: 'Doprava', value: order.shippingMethod || '—' }
  ]);

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border:1px solid #e2e8f0;">${item.productName}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${item.quantity}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const itemsTable = order.items.length ? `
    <h3 style="margin:16px 0 8px 0;color:#0f172a;">Položky objednávky</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Produkt</th>
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Množ.</th>
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Spolu</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
  ` : '';

  const content = `
    ${summary}
    ${customerEmail ? infoNote(`Email zákazníka: <strong>${customerEmail}</strong>`) : ''}
    ${itemsTable}
    <p style="margin:0;color:#475569;">Podrobnosti nájdete v admin DB.</p>
  `;

  const email = new SendSmtpEmail();
  email.subject = `Nová objednávka #${order.id}`;
  email.htmlContent = renderEmail({
    title: `Nová objednávka #${order.id}`,
    preheader: `Nová objednávka v hodnote ${formatCurrency(order.total)}`,
    content,
    highlight: `Suma ${formatCurrency(order.total)}`,
    footerNote: 'Pozrite admin DB na detaily.'
  });
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
  const apiKey = getBrevoApiKey();
  if (!apiKey || !to) return;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';
  const status = statusTexts[code] || `Status ${code}`;
  const trackingUrl = barcode ? `https://tracking.packeta.com/sk/?id=${barcode}` : null;

  const content = `
    ${infoNote(`Balík sme posunuli ďalej. Aktuálny stav: <strong>${status}</strong>.`)}
    ${trackingUrl ? `<p style="margin:0 0 12px 0;color:#475569;">Sledovať balík: <a href="${trackingUrl}" style="color:#0f766e;">${trackingUrl}</a></p>` : ''}
    <p style="margin:0;color:#475569;">Ak niečo nesedí alebo potrebujete pomôcť, stačí odpovedať na tento email.</p>
  `;

  const email = new SendSmtpEmail();
  email.subject = `Aktualizácia zásielky: ${status}`;
  email.htmlContent = renderEmail({
    title: `Stav zásielky k objednávke #${order.id}`,
    preheader: `Aktuálny stav: ${status}`,
    content,
    footerNote: 'Sme tu pre vás – odpovedzte, ak potrebujete upresniť doručenie.'
  });
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: to }];

  return api.sendTransacEmail(email);
}

export async function sendReturnNoticeEmail(order: OrderWithRelations, to: string) {
  const apiKey = getBrevoApiKey();
  if (!apiKey || !to) return;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const rows = [
    { label: 'Objednávka', value: `#${order.orderNumber}` },
    { label: 'Spôsob platby', value: order.paymentMethod === 'cod' ? 'Dobierka' : 'Platba kartou' },
    { label: 'Suma', value: `${order.total.toString()} ${order.currency}` }
  ];

  const content = `
    ${infoNote('Zásielka sa nám vrátila ako neprevzatá.')}
    <p style="margin:0 0 12px 0;color:#475569;">Ak si prajete opätovné odoslanie, odpovedzte na tento email a dohodneme detaily. Pri platbe kartou vieme riešiť refund alebo opätovné odoslanie podľa vašej preferencie.</p>
    ${keyValueTable(rows)}
  `;

  const billing = order.addresses.find(a => a.type === 'BILLING');
  const greeting = billing?.firstName ? `Ahoj ${billing.firstName},` : 'Ahoj,';

  const email = new SendSmtpEmail();
  email.subject = `Zásielka k objednávke #${order.orderNumber} sa vrátila`;
  email.htmlContent = renderEmail({
    title: 'Zásielka sa vrátila',
    preheader: 'Neprevzatá zásielka – daj nám vedieť, ako pokračovať',
    greeting,
    content,
    footerNote: 'Stačí odpovedať na tento email a dohodneme opätovné odoslanie alebo refund.'
  });
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: to }];

  return api.sendTransacEmail(email);
}

export async function sendInvoiceLinkEmail(order: OrderWithRelations, to: string, invoiceUrl: string, invoiceNumber: string) {
  const apiKey = getBrevoApiKey();
  if (!apiKey || !to || !invoiceUrl) return;

  const billing = order.addresses.find(a => a.type === 'BILLING');
  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const rows = [
    { label: 'Objednávka', value: `#${order.orderNumber}` },
    { label: 'Spôsob platby', value: order.paymentMethod === 'cod' ? 'Dobierka' : 'Platba kartou' },
    { label: 'Doprava', value: order.shippingMethod || '—' },
    { label: 'Suma', value: `${order.total.toString()} ${order.currency}` }
  ];

  const content = `
    ${infoNote(`Faktúra <strong>${invoiceNumber}</strong> je už pripravená. Nájdete ju vždy v sekcii "Moje objednávky".`)}
    ${keyValueTable(rows)}
    <p style="margin:0;color:#475569;">Ak chcete faktúru ihneď stiahnuť, kliknite na tlačidlo nižšie.</p>
  `;

  const greeting = billing?.firstName ? `Ahoj ${billing.firstName},` : 'Ahoj,';
  const footerNote = 'Faktúru nájdete aj vo svojom účte pod objednávkami.';

  const email = new SendSmtpEmail();
  email.subject = `Faktúra ${invoiceNumber} k objednávke #${order.orderNumber}`;
  email.htmlContent = renderEmail({
    title: 'Faktúra je pripravená',
    preheader: `Stiahni faktúru ${invoiceNumber}`,
    greeting,
    content,
    highlight: `Faktúra ${invoiceNumber}`,
    cta: { label: 'Stiahnuť faktúru', url: invoiceUrl },
    footerNote
  });
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: to }];

  return api.sendTransacEmail(email);
}
