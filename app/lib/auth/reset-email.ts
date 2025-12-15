import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

type ResetEmailParams = {
  to: string;
  firstName?: string | null;
  resetUrl: string;
};

const buildHtml = (params: ResetEmailParams) => `
  <div style="font-family: 'Inter', Arial, sans-serif; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 24px; margin: 0 0 12px 0;">Obnovenie hesla</h1>
    <p style="margin: 0 0 12px 0;">Ahoj ${params.firstName ? params.firstName : ''},</p>
    <p style="margin: 0 0 12px 0;">Požiadali ste o obnovenie hesla. Kliknite na tlačidlo nižšie a nastavte si nové heslo. Odkaz je platný ${process.env.PASSWORD_RESET_TTL_MINUTES || 30} minút.</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${params.resetUrl}" style="background: #059669; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 700;">Obnoviť heslo</a>
    </p>
    <p style="margin: 0 0 12px 0;">Ak ste o zmenu hesla nepožiadali, môžete tento email ignorovať.</p>
  </div>
`;

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
