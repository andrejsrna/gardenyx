import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body as { token?: string; email?: string };
    if (!token || !email) {
      return NextResponse.json({ error: 'Missing token or email' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    const record = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    if (!record) {
      return NextResponse.json({ error: 'Token not found or used' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(token, record.token);
    const now = new Date();
    if (!isValid || record.expiresAt < now) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() }
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: now }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/verify-email] error', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
