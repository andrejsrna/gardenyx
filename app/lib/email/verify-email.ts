import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { renderEmail, emailButton, infoNote } from './template';

type VerifyEmailParams = {
  to: string;
  firstName?: string | null;
  verifyUrl: string;
};

export async function sendVerifyEmail(params: VerifyEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'GardenYX';

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const greeting = params.firstName ? `Ahoj ${params.firstName},` : 'Dobrý deň,';
  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">Ešte posledný krok – potvrďte prosím svoj email, aby sme vám vedeli bezpečne posielať dôležité správy.</p>
    ${emailButton({ label: 'Overiť email', url: params.verifyUrl })}
    ${infoNote(`Ak tlačidlo nefunguje, skopírujte odkaz do prehliadača: <a href="${params.verifyUrl}" style="color:#0f766e;">${params.verifyUrl}</a>`)}
  `;

  const email = new SendSmtpEmail();
  email.subject = 'Overte svoju emailovú adresu';
  email.htmlContent = renderEmail({
    title: 'Overenie emailu',
    preheader: 'Potvrďte email a dokončite registráciu',
    greeting,
    content,
    footerNote: 'Ak ste o registráciu nepožiadali, pokojne email ignorujte.'
  });
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return api.sendTransacEmail(email);
}
