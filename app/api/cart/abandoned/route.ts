import { NextResponse } from 'next/server';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { renderEmail, emailButton, infoNote } from '@/app/lib/email/template';

function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return apiInstance;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  slug?: string;
}

interface AbandonedCart {
  items: CartItem[];
  totalPrice: number;
  timestamp: string;
  email: string;
}

export async function POST(request: Request) {
  try {
    const cart: AbandonedCart = await request.json();

    if (!cart.email || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    // Format cart items for email
    const itemsList = cart.items
      .map(item => `
        <tr>
          <td style="padding:10px;border:1px solid #e2e8f0;">${item.name}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">${item.quantity}x</td>
          <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">${item.price.toFixed(2)} €</td>
        </tr>
      `)
      .join('');

    const content = `
      <p style="margin:0 0 10px 0;color:#475569;">Váš košík stále čaká. Ak sa chcete vrátiť k objednávke, tu je rýchly prehľad:</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background-color:#f8fafc;">
            <th style="padding:10px;text-align:left;border:1px solid #e2e8f0;">Produkt</th>
            <th style="padding:10px;text-align:center;border:1px solid #e2e8f0;">Množstvo</th>
            <th style="padding:10px;text-align:right;border:1px solid #e2e8f0;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
          <tr>
            <td colspan="2" style="padding:10px;font-weight:bold;border:1px solid #e2e8f0;">Celková suma:</td>
            <td style="padding:10px;text-align:right;font-weight:bold;color:#16a34a;border:1px solid #e2e8f0;">${cart.totalPrice.toFixed(2)} €</td>
          </tr>
        </tbody>
      </table>
      ${emailButton({ label: 'Dokončiť objednávku', url: 'https://najsilnejsiaklbovavyziva.sk/pokladna' })}
      ${infoNote('Ak ste dostali tento email omylom alebo už máte objednané, stačí ho ignorovať.')}
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Dokončite svoj nákup na Najsilnejšia kĺbová výživa';
    sendSmtpEmail.htmlContent = renderEmail({
      title: 'Váš košík na vás čaká',
      preheader: 'Dokončite svoj nákup na Najsilnejšia kĺbová výživa',
      content
    });
    sendSmtpEmail.sender = { name: 'Najsilnejšia kĺbová výživa', email: 'noreply@najsilnejsiaklbovavyziva.sk' };
    sendSmtpEmail.to = [{ email: cart.email }];

    // Send the email
    const apiInstance = getBrevoClient();
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Store the abandoned cart in your database here if needed
    // await prisma.abandonedCart.create({ data: cart });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process abandoned cart:', error);
    return NextResponse.json(
      { error: 'Failed to process abandoned cart' },
      { status: 500 }
    );
  }
} 
