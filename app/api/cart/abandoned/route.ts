import { NextResponse } from 'next/server';
import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error('BREVO_API_KEY is not set in environment variables');
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
          <td style="padding: 10px;">${item.name}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity}x</td>
          <td style="padding: 10px; text-align: right;">${item.price.toFixed(2)} €</td>
        </tr>
      `)
      .join('');

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Dokončite svoj nákup na Najsilnejšia kĺbová výživa';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Váš košík na vás čaká</h2>
        <p>Všimli sme si, že ste nedokončili svoj nákup na Najsilnejšia kĺbová výživa. Váš košík obsahuje:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Produkt</th>
              <th style="padding: 10px; text-align: center;">Množstvo</th>
              <th style="padding: 10px; text-align: right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
            <tr style="border-top: 2px solid #e5e7eb;">
              <td colspan="2" style="padding: 10px; font-weight: bold;">Celková suma:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">
                ${cart.totalPrice.toFixed(2)} €
              </td>
            </tr>
          </tbody>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://najsilnejsiaklbovavyziva.sk/pokladna" 
             style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Dokončiť objednávku
          </a>
        </div>

        <p style="margin-top: 24px; color: #666; font-size: 12px; text-align: center;">
          Ak ste dostali tento email omylom, môžete ho ignorovať.
        </p>
      </div>
    `;
    sendSmtpEmail.sender = { name: 'Najsilnejšia kĺbová výživa', email: 'noreply@najsilnejsiaklbovavyziva.sk' };
    sendSmtpEmail.to = [{ email: cart.email }];

    // Send the email
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