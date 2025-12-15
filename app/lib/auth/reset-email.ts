import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { renderEmail, emailButton, infoNote } from '../email/template';

type ResetEmailParams = {
  to: string;
  firstName?: string | null;
  resetUrl: string;
};

const buildHtml = (params: ResetEmailParams) => {
  const greeting = params.firstName ? `Ahoj ${params.firstName},` : 'Ahoj,';
  const ttl = process.env.PASSWORD_RESET_TTL_MINUTES || 30;
  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">Požiadali ste o obnovenie hesla. Kliknite na tlačidlo nižšie a nastavte si nové heslo. Odkaz je platný ${ttl} minút.</p>
    ${emailButton({ label: 'Obnoviť heslo', url: params.resetUrl })}
    ${infoNote(`Ak tlačidlo nefunguje, skopírujte si odkaz: <a href="${params.resetUrl}" style="color:#0f766e;">${params.resetUrl}</a>`)}
  `;

  return renderEmail({
    title: 'Obnovenie hesla',
    preheader: 'Link na nastavenie nového hesla',
    greeting,
    content,
    footerNote: 'Ak ste o zmenu hesla nepožiadali, môžete tento email ignorovať.'
  });
};

export async function sendResetEmail(params: ResetEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const email = new SendSmtpEmail();
  email.subject = 'Obnovenie hesla';
  email.htmlContent = buildHtml(params);
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return apiInstance.sendTransacEmail(email);
}
