import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

type VerifyEmailParams = {
  to: string;
  firstName?: string | null;
  verifyUrl: string;
};

export async function sendVerifyEmail(params: VerifyEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const email = new SendSmtpEmail();
  email.subject = 'Overte svoju emailovú adresu';
  email.htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 640px; margin:0 auto; padding:24px; color:#0f172a;">
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:800;">Overenie emailu</h1>
      <p style="margin:0 0 12px 0;">${params.firstName ? `Ahoj ${params.firstName},` : 'Dobrý deň,'}</p>
      <p style="margin:0 0 12px 0;">Kliknite na tlačidlo nižšie a overte svoj email.</p>
      <p style="margin:0 0 18px 0;">
        <a href="${params.verifyUrl}" style="display:inline-block;padding:12px 18px;background:#059669;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">Overiť email</a>
      </p>
      <p style="margin:0;color:#1f2937;">Ak ste o registráciu nepožiadali, ignorujte tento email.</p>
    </div>
  `;
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return api.sendTransacEmail(email);
}
