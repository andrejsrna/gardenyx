import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '../../../lib/prisma';
import { upsertBrevoContact } from '../../../lib/newsletter/brevo';

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, firstName, lastName, source } = parsed.data;

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
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
          email,
          firstName,
          lastName,
          listId: brevoListId,
        });
        if (brevoId && !subscriber.brevoContactId) {
          await prisma.newsletterSubscriber.update({
            where: { email },
            data: { brevoContactId: brevoId },
          });
        }
      } catch (error) {
        console.warn('[newsletter] Failed to sync to Brevo', error);
      }
    }

    return NextResponse.json({ status: 'subscribed' });
  } catch (error) {
    console.error('[newsletter] Subscribe error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
