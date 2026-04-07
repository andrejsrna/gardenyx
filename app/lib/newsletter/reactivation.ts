import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { getSiteUrl } from '../automation/config';
import { renderEmail, emailButton, infoNote } from '../email/template';

const subject = 'Majte GardenYX stále po ruke';
const CTA_URL = `${getSiteUrl()}/stiahnut`;

const greeting = (firstName?: string | null) => {
  const clean = firstName?.trim();
  return clean ? `Ahoj ${clean},` : 'Ahoj,';
};

const buildText = (firstName?: string | null) => `${greeting(firstName)}

Pripomíname len jednu praktickú vec: aplikáciu GardenYX môžete mať stále po ruke.

Nájdete v nej prehľad produktov, odporúčané dávkovanie a jednoduché tipy pre starostlivosť o záhradu.

Čo v aplikácii nájdete:
- odporúčané dávkovanie podľa typu rastliny
- pripomienky starostlivosti a použitia produktov
- rýchly prehľad toho, čo a kedy použiť
${CTA_URL}

Ak potrebujete niečo prebrať, stačí odpísať na tento email.

Tím GardenYX`;

export async function sendReactivationEmail(to: string, firstName?: string | null, lastName?: string | null) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'GardenYX';

  const apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">Pripomíname len jednu praktickú vec: aplikáciu GardenYX môžete mať stále po ruke.</p>
    <p style="margin:0 0 18px 0;color:#475569;">Nájdete v nej prehľad produktov, odporúčané dávkovanie a jednoduché tipy pre starostlivosť o záhradu.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;">
      <tr>
        <td style="padding:18px;border:1px solid #bbf7d0;border-radius:16px;background:#f0fdf4;">
          <p style="margin:0 0 10px 0;font-size:14px;font-weight:700;color:#166534;">Čo nájdete v aplikácii GardenYX:</p>
          <ul style="margin:0;padding-left:18px;color:#1f2937;">
            <li style="margin:0 0 8px 0;">Odporúčané dávkovanie podľa typu rastliny</li>
            <li style="margin:0 0 8px 0;">Praktické pripomienky starostlivosti</li>
            <li style="margin:0;">Rýchly prehľad produktov a použitia</li>
          </ul>
        </td>
      </tr>
    </table>
    ${emailButton({ label: 'Pozrieť aplikáciu GardenYX', url: CTA_URL })}
    ${infoNote('Ak potrebujete niečo prebrať, stačí odpísať na tento email. Radi poradíme so starostlivosťou o záhradu krok za krokom.')}
    <p style="margin:10px 0 4px 0;color:#0f172a;font-weight:700;">Tím GardenYX</p>
    <p style="margin:0 0 18px 0;color:#475569;font-size:13px;">GardenYX</p>
  `;

  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = renderEmail({
    title: subject,
    preheader: 'Praktický tip a aplikácia GardenYX',
    greeting: greeting(firstName),
    content,
    footerNote: 'Ak ste email neočakávali, stačí ho ignorovať.'
  });
  sendSmtpEmail.textContent = buildText(firstName);
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: to, name: [firstName, lastName].filter(Boolean).join(' ') || undefined }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
}
