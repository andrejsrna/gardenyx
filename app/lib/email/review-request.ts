import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { renderEmail, emailButton, infoNote } from './template';

type ReviewEmailParams = {
  to: string;
  firstName?: string | null;
  reviewUrl: string;
  token: string;
};

export async function sendReviewRequestEmail(params: ReviewEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const greeting = params.firstName ? `Ahoj ${params.firstName},` : 'Ahoj,';
  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">Ubehlo pár mesiacov od tvojej objednávky a zaujíma nás, ako sa ti produkt osvedčil. Stačí krátka recenzia – po odoslaní ti pošleme zľavový kupón.</p>
    <p style="margin:0 0 12px 0;color:#475569;">Kód na sprístupnenie formulára: <strong>${params.token}</strong></p>
    ${emailButton({ label: 'Otvoriť formulár na recenziu', url: params.reviewUrl })}
    ${infoNote('Link aj kód sú jednorazové a patria k tejto emailovej adrese. Ak máš otázky, odpovedz na tento email.')}
  `;

  const email = new SendSmtpEmail();
  email.subject = 'Ako sa ti osvedčil náš produkt?';
  email.htmlContent = renderEmail({
    title: 'Máš chvíľku na krátku recenziu?',
    preheader: 'Po recenzii ti pošleme kupón na ďalší nákup',
    greeting,
    content,
    footerNote: 'Ďakujeme, že nám pomáhaš robiť lepšie produkty.'
  });
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return api.sendTransacEmail(email);
}
