import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email, password } = body as { token?: string; email?: string; password?: string };
    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Token not found or used' }, { status: 400 });
    }
    const isValid = await bcrypt.compare(token, tokenRecord.token);
    const now = new Date();
    if (!isValid || tokenRecord.expiresAt < now) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: now }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reset-password] error', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
