import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { getSiteUrl } from '../automation/config';
import { renderEmail, emailButton } from './template';

const SUBJECT = 'Robíte to správne';
const CTA_URL = `${getSiteUrl()}/stiahnut`;
const CTA_LABEL = 'Pozrieť aplikáciu GardenYX';

type GuidanceEmailParams = {
  to: string;
  firstName?: string | null;
};

const buildChecklist = () => `
  <p style="margin:16px 0 6px 0;color:#0f172a;font-weight:700;">Ak si môžete odškrtnúť aspoň 2 z týchto bodov, ste na dobrej ceste:</p>
  <ul style="margin:0;padding-left:20px;color:#1f2937;line-height:1.7;">
    <li>☑️ máte prehľad, čo a kedy použiť</li>
    <li>☑️ sledujete dávkovanie podľa rastliny</li>
    <li>☑️ plánujete starostlivosť pravidelne</li>
    <li>☑️ reagujete včas na potreby záhrady</li>
  </ul>
`;

const buildEducation = () => `
  <p style="margin:0 0 8px 0;color:#475569;">Vo všeobecnosti platí:</p>
  <ul style="margin:0;padding-left:20px;color:#0f172a;line-height:1.6;">
    <li>Pravidelnosť je dôležitejšia než improvizácia</li>
    <li>Správne dávkovanie šetrí čas aj produkty</li>
    <li>Najlepšie výsledky prináša starostlivosť podľa sezóny a typu rastliny</li>
  </ul>
  <p style="margin:10px 0 0 0;color:#475569;">Presne v tomto pomáha aplikácia GardenYX.</p>
`;

export async function sendGuidanceEmail(params: GuidanceEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'GardenYX';

  const greeting = params.firstName ? `Ahoj ${params.firstName},` : 'Ahoj,';

  const content = `
    <p style="margin:0 0 12px 0;color:#475569;">ďakujeme za vašu objednávku v GardenYX. Ak sa chcete rýchlo zorientovať v starostlivosti o záhradu, máme pre vás jednoduchý ďalší krok:</p>
    <p style="margin:0 0 12px 0;color:#475569;"><strong>👉 stiahnite si aplikáciu GardenYX a majte odporúčania vždy po ruke.</strong></p>
    <p style="margin:0 0 18px 0;color:#475569;">V aplikácii nájdete praktické pripomienky, dávkovanie a tipy pre rastliny.</p>
    ${buildEducation()}
    ${buildChecklist()}
    <p style="margin:24px 0 8px 0;color:#475569;"><strong>👉 Všetko dôležité nájdete na jednom mieste aj v mobile.</strong></p>
    ${emailButton({ label: CTA_LABEL, url: CTA_URL })}
    <p style="margin:18px 0 6px 0;color:#0f172a;font-weight:700;">Tím GardenYX</p>
    <p style="margin:0;color:#475569;">Ak máte otázku, pokojne nám odpíšte priamo na tento email.</p>
  `;

  const textContent = `
    ${greeting}

    ďakujeme za vašu objednávku v GardenYX.
    👉 stiahnite si aplikáciu GardenYX a majte odporúčania vždy po ruke.
    V aplikácii nájdete praktické pripomienky, dávkovanie a tipy pre rastliny.

    Vo všeobecnosti platí:
    - pravidelnosť je dôležitejšia než improvizácia
    - správne dávkovanie šetrí čas aj produkty
    - najlepšie výsledky prináša starostlivosť podľa sezóny a typu rastliny
    Presne v tomto pomáha aplikácia GardenYX.

    Checklist:
    ☑️ máte prehľad, čo a kedy použiť
    ☑️ sledujete dávkovanie podľa rastliny
    ☑️ plánujete starostlivosť pravidelne
    ☑️ reagujete včas na potreby záhrady

    👉 Všetko dôležité nájdete na jednom mieste aj v mobile.
    Viac na: ${CTA_URL}

    Tím GardenYX

    Ak máte otázku, pokojne nám odpíšte priamo na tento email.
  `;

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const email = new SendSmtpEmail();
  email.subject = SUBJECT;
  email.htmlContent = renderEmail({
    title: SUBJECT,
    preheader: 'Krátky GardenYX check-in po objednávke',
    greeting,
    content,
    cta: { label: CTA_LABEL, url: CTA_URL },
    footerNote: 'Ak máte otázku, pokojne nám odpíšte priamo na tento email.'
  });
  email.textContent = textContent.trim();
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  return api.sendTransacEmail(email);
}
