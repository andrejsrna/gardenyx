import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '../../../lib/prisma';
import { upsertBrevoContact } from '../../../lib/newsletter/brevo';
import { rateLimit } from '../../../lib/utils/rateLimit';

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
  consent: z.boolean(),
  honeypot: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, firstName, lastName, source, consent, honeypot } = parsed.data;

    if (!consent) {
      return NextResponse.json({ error: 'Consent required' }, { status: 400 });
    }

    if (honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    try {
      await rateLimit(ip, 'newsletter');
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        firstName,
        lastName,
        source,
        status: 'active',
      },
      update: {
        firstName,
        lastName,
        source: source || undefined,
        status: 'active',
        unsubscribedAt: null,
      },
    });

    const brevoListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoId = await upsertBrevoContact({
          email: normalizedEmail,
          firstName,
          lastName,
          listId: brevoListId,
        });
        if (brevoId && !subscriber.brevoContactId) {
          await prisma.newsletterSubscriber.update({
            where: { email: normalizedEmail },
            data: { brevoContactId: brevoId },
          });
        }
      } catch (err) {
        console.warn('[newsletter] Failed to sync to Brevo', err);
      }
    }

    return NextResponse.json({ status: 'subscribed' });
  } catch (error) {
    console.error('[newsletter] Subscribe error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
