import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '../../../lib/prisma';
import { blacklistBrevoContact } from '../../../lib/newsletter/brevo';

const unsubscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = unsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email } = parsed.data;

    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!subscriber) {
      return NextResponse.json({ status: 'ok' });
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { status: 'unsubscribed', unsubscribedAt: new Date() },
    });

    if (process.env.BREVO_API_KEY) {
      try {
        await blacklistBrevoContact(email);
      } catch (error) {
        console.warn('[newsletter] Failed to blacklist in Brevo', error);
      }
    }

    return NextResponse.json({ status: 'unsubscribed' });
  } catch (error) {
    console.error('[newsletter] Unsubscribe error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
