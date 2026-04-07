import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { getSiteUrl } from '../automation/config';
import { renderEmail, emailButton, infoNote } from './template';

type ReviewThankYouParams = {
  to: string;
  firstName?: string | null;
  couponCode: string;
};

export async function sendReviewThankYouEmail(params: ReviewThankYouParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'GardenYX';

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const greeting = params.firstName ? `Ahoj ${params.firstName},` : 'Ahoj,';
  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">Ďakujeme za tvoju recenziu. Vážime si, že pomáhaš ostatným rozhodnúť sa.</p>
    <p style="margin:0 0 12px 0;color:#475569;">Tu je tvoj kupón na ďalší nákup:</p>
    <div style="margin:0 0 14px 0;padding:12px 14px;border-radius:12px;background:#ecfdf3;color:#064e3b;font-weight:800;letter-spacing:0.04em;">${params.couponCode}</div>
    ${emailButton({ label: 'Nakúpiť s kupónom', url: `${getSiteUrl()}?coupon=${encodeURIComponent(params.couponCode)}` })}
    ${infoNote('Kupón je jednorazový a platí pre túto emailovú adresu. Ak niečo nefunguje, odpovedz na tento email.')}
  `;

  const email = new SendSmtpEmail();
  email.subject = 'Ďakujeme za recenziu — tu je tvoj kupón';
  email.htmlContent = renderEmail({
    title: 'Ďakujeme za recenziu',
    preheader: 'Tvoj kupón na ďalší nákup je vo vnútri',
    greeting,
    content,
    footerNote: 'Sme tu, ak potrebuješ pomoc alebo radu k produktom.'
  });
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return api.sendTransacEmail(email);
}
