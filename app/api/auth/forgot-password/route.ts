import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { sendResetEmail } from '@/app/lib/auth/reset-email';

const TOKEN_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email as string | undefined)?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success to avoid leakage, but only issue token if user exists
    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const hashed = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          token: hashed,
          userId: user.id,
          expiresAt
        }
      });

      try {
        await sendResetEmail({
          to: email,
          firstName: user.firstName,
          resetUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://najsilnejsiaklbovavyziva.sk'}/reset-hesla?token=${rawToken}&email=${encodeURIComponent(email)}`
        });
      } catch (err) {
        console.warn('[forgot-password] Failed to send email', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/forgot-password] error', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
