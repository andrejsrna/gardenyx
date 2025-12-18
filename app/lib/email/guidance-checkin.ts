import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { renderEmail, emailButton } from './template';

const SUBJECT = 'Robíš to správne 👍';
const CTA_URL = 'https://najsilnejsiaklbovavyziva.sk/ako-podporit-zdravie-klbov-doma';
const CTA_LABEL = '🟢 Pozrieť jednoduchý tip pre kĺby';

type GuidanceEmailParams = {
  to: string;
  firstName?: string | null;
};

const buildChecklist = () => `
  <p style="margin:16px 0 6px 0;color:#0f172a;font-weight:700;">Ak si môžeš odškrtnúť aspoň 2 z týchto bodov, si na dobrej ceste:</p>
  <ul style="margin:0;padding-left:20px;color:#1f2937;line-height:1.7;">
    <li>☑️ používaš gél lokálne podľa potreby</li>
    <li>☑️ kapsule berieš pravidelne</li>
    <li>☑️ dávaš telu pohyb, nie šok</li>
    <li>☑️ piješ dostatok vody</li>
  </ul>
`;

const buildEducation = () => `
  <p style="margin:0 0 8px 0;color:#475569;">Vo všeobecnosti platí:</p>
  <ul style="margin:0;padding-left:20px;color:#0f172a;line-height:1.6;">
    <li>Gél – úľava často už do niekoľkých minút</li>
    <li>Kapsule – postupná podpora, zvyčajne 7–21 dní</li>
    <li>Najlepší efekt má kombinácia zvonka + zvnútra</li>
  </ul>
  <p style="margin:10px 0 0 0;color:#475569;">To, že ideš krok za krokom, je presne to, čo máš robiť.</p>
`;

export async function sendGuidanceEmail(params: GuidanceEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'NKV';

  const greeting = params.firstName ? `Ahoj ${params.firstName},` : 'Ahoj,';

  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">ak používaš JointBoost už pár dní, chceme ťa len krátko uistiť o jednej veci:</p>
    <p style="margin:0 0 12px 0;color:#475569;"><strong>👉 ak ešte necítiš veľké zmeny, je to úplne v poriadku.</strong></p>
    <p style="margin:0 0 18px 0;color:#475569;">Každé telo reaguje inak a dôležitá je najmä pravidelnosť.</p>
    ${buildEducation()}
    ${buildChecklist()}
    <p style="margin:24px 0 8px 0;color:#475569;"><strong>👉 Pripravili sme krátky CARE tip, ktorý veľa zákazníkom pomohol cítiť sa lepšie už po pár dňoch.</strong></p>
    ${emailButton({ label: CTA_LABEL, url: CTA_URL })}
    <p style="margin:18px 0 6px 0;color:#0f172a;font-weight:700;">Držím palce,</p>
    <p style="margin:0 0 6px 0;color:#0f172a;font-weight:700;">Andrej<br />Zakladateľ JointBoost</p>
    <img src="https://najsilnejsiaklbovavyziva.sk/podpis.png" alt="Andrej podpis" style="display:block;margin:0 0 8px 0;max-width:220px;height:auto;" />
    <p style="margin:0;color:#475569;">Ak máš otázku, pokojne mi odpíš priamo na tento email.</p>
  `;

  const textContent = `
    ${greeting}

    ak používaš JointBoost už pár dní, chceme ťa len krátko uistiť o jednej veci:
    👉 ak ešte necítiš veľké zmeny, je to úplne v poriadku.
    Každé telo reaguje inak a dôležitá je najmä pravidelnosť.

    Vo všeobecnosti platí:
    - Gél – úľava často už do niekoľkých minút
    - Kapsule – postupná podpora, zvyčajne 7–21 dní
    - Najlepší efekt má kombinácia zvonka + zvnútra
    To, že ideš krok za krokom, je presne to, čo máš robiť.

    Checklist:
    ☑️ používaš gél lokálne podľa potreby
    ☑️ kapsule berieš pravidelne
    ☑️ dávaš telu pohyb, nie šok
    ☑️ piješ dostatok vody

    👉 Pripravili sme krátke tipy, ktoré veľa zákazníkom pomohli cítiť sa lepšie už po pár dňoch.
    Viac na: ${CTA_URL}

    Držím palce,
    Andrej
    Zakladateľ JointBoost

    Ak máš otázku, pokojne mi odpíš priamo na tento email.
  `;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const email = new SendSmtpEmail();
  email.subject = SUBJECT;
  email.htmlContent = renderEmail({
    title: SUBJECT,
    preheader: 'Krátky check-in, či ideš v správnom smere',
    greeting,
    content,
    cta: { label: CTA_LABEL, url: CTA_URL },
    footerNote: 'Ak máš otázku, pokojne mi odpíš priamo na tento email.'
  });
  email.textContent = textContent.trim();
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return api.sendTransacEmail(email);
}
