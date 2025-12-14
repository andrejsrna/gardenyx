import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

const subject = 'Ako sa dnes majú tvoje kĺby?';
const CTA_URL = 'https://najsilnejsiaklbovavyziva.sk/ako-podporit-zdravie-klbov-doma';
const LOGO_URL = 'https://najsilnejsiaklbovavyziva.sk/logo.png';
const HOME_URL = 'https://najsilnejsiaklbovavyziva.sk';

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

const buildHtml = (firstName?: string | null) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f7fb;padding:0;margin:0;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:700px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 25px 60px rgba(16,185,129,0.12);">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg,#10b981 0%,#0fb981 45%,#0f766e 100%);color:#ecfdf3;">
                <tr>
                  <td style="padding:18px 22px;font-family:'Inter','Arial',sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">
                    <a href="${HOME_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;color:#ecfdf3;">
                      <img src="${LOGO_URL}" alt="Najsilnejšia kĺbová výživa" width="140" height="42" style="display:block;max-width:140px;height:auto;" />
                    </a>
                  </td>
                  <td align="right" style="padding:18px 22px;font-family:'Inter','Arial',sans-serif;font-size:12px;font-weight:600;">Starostlivosť o tvoje kĺby</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 22px 10px 22px;font-family:'Inter','Arial',sans-serif;color:#0f172a;font-size:15px;line-height:24px;background:linear-gradient(180deg,#f8fafc 0%,#ffffff 18%);">
              <p style="margin:0 0 12px 0;color:#0f172a;">${greeting(firstName)}</p>
              <h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;font-weight:800;color:#052e16;">${subject}</h1>
              <p style="margin:0 0 12px 0;color:#1f2937;">Len sme chceli jemne skontrolovať, ako sa dnes majú tvoje kĺby. Žiadny predaj, žiadna povinnosť odpovedať — len úprimný záujem.</p>
              <p style="margin:0 0 18px 0;color:#1f2937;">Každé telo reaguje inak. Niekto cíti úľavu rýchlo, niekomu to trvá dlhšie — a je to úplne v poriadku. Ak cítiš pnutie alebo bolesť, stačí spomaliť, dopriať si regeneráciu a prispôsobiť pohyb.</p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;">
                <tr>
                  <td style="padding:18px;border:1px solid #bbf7d0;border-radius:16px;background:#f0fdf4;">
                    <p style="margin:0 0 10px 0;font-size:14px;font-weight:700;color:#166534;">Čo nájdeš v 2-minútovom tipe „Ako podporiť zdravie kĺbov doma“:</p>
                    <ul style="margin:0;padding-left:18px;color:#1f2937;">
                      <li style="margin:0 0 8px 0;">10-min ranný warm-up na rozhýbanie kĺbov</li>
                      <li style="margin:0 0 8px 0;">3 potraviny pre kĺby: omega-3, kolagén + vitamín C, zelená zelenina</li>
                      <li style="margin:0;">mikronávyk na regeneráciu a sledovanie signálov tela</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
                <tr>
                  <td style="border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#10b981 0%,#0ea5e9 100%);">
                    <a href="${CTA_URL}" style="display:inline-block;padding:14px 20px;font-family:'Inter','Arial',sans-serif;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">🟢 Pozrieť krátky tip pre kĺby</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 14px 0;">
                <tr>
                  <td style="padding:16px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
                    <p style="margin:0;color:#475569;font-size:14px;line-height:22px;">Ak potrebuješ niečo prebrať, stačí odpísať na tento email. Radi ti odporučíme, ako na starostlivosť o kĺby krok za krokom.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:10px 0 4px 0;color:#0f172a;font-weight:700;">Tím NKV</p>
              <p style="margin:0 0 18px 0;color:#475569;font-size:13px;">Najsilnejšia kĺbová výživa | JointBoost</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export async function sendReactivationEmail(to: string, firstName?: string | null, lastName?: string | null) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = buildHtml(firstName);
  sendSmtpEmail.textContent = buildText(firstName);
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: to, name: [firstName, lastName].filter(Boolean).join(' ') || undefined }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
}
