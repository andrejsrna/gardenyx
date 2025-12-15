import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { sendVerifyEmail } from '@/app/lib/email/verify-email';
import { attachOrdersToUser } from '@/app/lib/auth/attach-orders';

const TOKEN_TTL_MINUTES = Number(process.env.EMAIL_VERIFY_TTL || 60 * 24);

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, consent, newsletter } = body as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      consent?: boolean;
      newsletter?: boolean;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Heslo musí mať aspoň 8 znakov' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: 'Je potrebné súhlasiť so spracovaním osobných údajov' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Účet s týmto emailom už existuje' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hash,
        firstName: firstName || null,
        lastName: lastName || null,
        emailVerifiedAt: null
      }
    });

    const rawToken = crypto.randomUUID().replace(/-/g, '');
    const hashed = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    const tokenDelegate = (prisma as unknown as { emailVerificationToken?: { create?: (args: unknown) => Promise<unknown> } }).emailVerificationToken;
    if (tokenDelegate?.create) {
      await tokenDelegate.create({
        data: {
          token: hashed,
          userId: user.id,
          expiresAt
        }
      });
    } else {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "EmailVerificationToken" ("id","token","userId","expiresAt","createdAt") VALUES ($1,$2,$3,$4,now())',
        crypto.randomUUID(),
        hashed,
        user.id,
        expiresAt
      );
    }

    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://najsilnejsiaklbovavyziva.sk'}/overit-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
    await sendVerifyEmail({
      to: normalizedEmail,
      firstName: user.firstName,
      verifyUrl
    });

    if (newsletter && process.env.BREVO_API_KEY) {
      try {
        const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
        await prisma.newsletterSubscriber.upsert({
          where: { email: normalizedEmail },
          create: { email: normalizedEmail, firstName, lastName, source: 'registration', status: 'active' },
          update: { firstName, lastName, source: 'registration', status: 'active', unsubscribedAt: null }
        });
        if (listId) {
          // Reuse existing brevo helper in subscribe route if needed
        }
      } catch (err) {
        console.warn('[auth/register] failed to subscribe newsletter', err);
      }
    }

    attachOrdersToUser(normalizedEmail, user.id).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/register] error', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
