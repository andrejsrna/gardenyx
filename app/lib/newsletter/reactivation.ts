import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { renderEmail, emailButton, infoNote } from '../email/template';

const subject = 'Ako sa dnes majú tvoje kĺby?';
const CTA_URL = 'https://najsilnejsiaklbovavyziva.sk/ako-podporit-zdravie-klbov-doma';

const greeting = (firstName?: string | null) => {
  const clean = firstName?.trim();
  return clean ? `Ahoj ${clean},` : 'Ahoj,';
};

const buildText = (firstName?: string | null) => `${greeting(firstName)}

Len sme chceli skontrolovať, ako sa dnes majú tvoje kĺby. Žiadny predaj, žiadna povinnosť odpovedať — len úprimný záujem.

Každé telo reaguje inak. Niekto cíti úľavu rýchlo, niekomu to trvá dlhšie — a je to úplne v poriadku. Ak cítiš pnutie alebo bolesť, stačí spomaliť, dopriať si regeneráciu a prispôsobiť pohyb.

Pripravili sme krátky 2-minútový tip „Ako podporiť zdravie kĺbov doma“:
- 10-min ranný warm-up, ktorý rozhýbe kĺby
- 3 potraviny pre kĺby: omega-3, kolagén + vitamín C, zelená zelenina
- jednoduchý mikronávyk na regeneráciu a sledovanie signálov tela
${CTA_URL}

Ak potrebuješ niečo prebrať, stačí odpísať na tento email.

Tím NKV`;

export async function sendReactivationEmail(to: string, firstName?: string | null, lastName?: string | null) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">Len sme chceli jemne skontrolovať, ako sa dnes majú tvoje kĺby. Žiadny predaj, žiadna povinnosť odpovedať — len úprimný záujem.</p>
    <p style="margin:0 0 18px 0;color:#475569;">Každé telo reaguje inak. Niekto cíti úľavu rýchlo, niekomu to trvá dlhšie — a je to úplne v poriadku. Ak cítiš pnutie alebo bolesť, stačí spomaliť, dopriať si regeneráciu a prispôsobiť pohyb.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;">
      <tr>
        <td style="padding:18px;border:1px solid #bbf7d0;border-radius:16px;background:#f0fdf4;">
          <p style="margin:0 0 10px 0;font-size:14px;font-weight:700;color:#166534;">Čo nájdeš v 2-minútovom tipe „Ako podporiť zdravie kĺbov doma“:</p>
          <ul style="margin:0;padding-left:18px;color:#1f2937;">
            <li style="margin:0 0 8px 0;">10-min ranný warm-up na rozhýbanie kĺbov</li>
            <li style="margin:0 0 8px 0;">3 potraviny pre kĺby: omega-3, kolagén + vitamín C, zelená zelenina</li>
            <li style="margin:0;">Mikronávyk na regeneráciu a sledovanie signálov tela</li>
          </ul>
        </td>
      </tr>
    </table>
    ${emailButton({ label: '🟢 Pozrieť krátky tip pre kĺby', url: CTA_URL })}
    ${infoNote('Ak potrebuješ niečo prebrať, stačí odpísať na tento email. Radi ti odporučíme, ako na starostlivosť o kĺby krok za krokom.')}
    <p style="margin:10px 0 4px 0;color:#0f172a;font-weight:700;">Tím NKV</p>
    <p style="margin:0 0 18px 0;color:#475569;font-size:13px;">Najsilnejšia kĺbová výživa | JointBoost</p>
  `;

  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = renderEmail({
    title: subject,
    preheader: 'Krátky 2-minútový tip pre kĺby',
    greeting: greeting(firstName),
    content,
    footerNote: 'Ak si email neočakával, stačí ho ignorovať.'
  });
  sendSmtpEmail.textContent = buildText(firstName);
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: to, name: [firstName, lastName].filter(Boolean).join(' ') || undefined }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
}
