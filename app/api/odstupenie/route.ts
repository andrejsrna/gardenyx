import { NextRequest, NextResponse } from 'next/server';
import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

const getBrevoApiKey = () => process.env.BREVO_API_KEY?.trim().replace(/^['"]|['"]$/g, '');

export async function POST(req: NextRequest) {
  const { meno, cisloObjednavky, email } = await req.json();

  if (!meno || !cisloObjednavky || !email) {
    return NextResponse.json({ error: 'Vyplňte všetky povinné polia.' }, { status: 400 });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Zadajte platný email.' }, { status: 400 });
  }

  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: 'Chyba konfigurácie servera.' }, { status: 500 });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'GardenYX';
  const adminEmail = 'support@gardenyx.eu';

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const adminHtml = `
    <p>Bolo prijaté oznámenie o odstúpení od zmluvy.</p>
    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td><strong>Meno a priezvisko</strong></td><td>${meno}</td></tr>
      <tr><td><strong>Číslo objednávky</strong></td><td>${cisloObjednavky}</td></tr>
      <tr><td><strong>Email zákazníka</strong></td><td>${email}</td></tr>
      <tr><td><strong>Dátum odoslania</strong></td><td>${dateStr}</td></tr>
      <tr><td><strong>Čas odoslania</strong></td><td>${timeStr}</td></tr>
    </table>
    <p>Vráťte platbu do 14 dní od doručenia tohto oznámenia.</p>
  `;

  const customerHtml = `
    <p>Vážený/á ${meno},</p>
    <p>Potvrdenie prijatia Vášho oznámenia o <strong>odstúpení od kúpnej zmluvy</strong> podľa § 7 zákona č. 102/2014 Z. z.</p>
    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td><strong>Meno a priezvisko</strong></td><td>${meno}</td></tr>
      <tr><td><strong>Číslo objednávky</strong></td><td>${cisloObjednavky}</td></tr>
      <tr><td><strong>Dátum odoslania</strong></td><td>${dateStr}</td></tr>
      <tr><td><strong>Čas odoslania</strong></td><td>${timeStr}</td></tr>
    </table>
    <p>Lehota na odstúpenie bola dodržaná, ak toto oznámenie odošlete pred uplynutím 14-dňovej lehoty od prevzatia tovaru.</p>
    <p>Platbu vrátime najneskôr do 14 dní od doručenia tohto oznámenia.</p>
    <p>V prípade otázok nás kontaktujte na ${adminEmail}.</p>
    <p>S pozdravom,<br/>Tím GardenYX</p>
  `;

  const adminEmailObj = new SendSmtpEmail();
  adminEmailObj.subject = `Odstúpenie od zmluvy – objednávka ${cisloObjednavky}`;
  adminEmailObj.htmlContent = adminHtml;
  adminEmailObj.sender = { name: senderName, email: senderEmail };
  adminEmailObj.to = [{ email: adminEmail }];
  adminEmailObj.replyTo = { email };

  const customerEmailObj = new SendSmtpEmail();
  customerEmailObj.subject = `Potvrdenie: Oznámenie o odstúpení od zmluvy`;
  customerEmailObj.htmlContent = customerHtml;
  customerEmailObj.sender = { name: senderName, email: senderEmail };
  customerEmailObj.to = [{ email, name: meno }];

  await Promise.all([
    api.sendTransacEmail(adminEmailObj),
    api.sendTransacEmail(customerEmailObj),
  ]);

  return NextResponse.json({ dateStr, timeStr });
}
