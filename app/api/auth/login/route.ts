import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { sessionConfig } from '@/app/lib/config/session';
import type { SessionData } from '@/app/lib/config/session';
import { attachOrdersToUser } from '@/app/lib/auth/attach-orders';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Nesprávne prihlasovacie údaje' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Nesprávne prihlasovacie údaje' }, { status: 401 });
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email nie je overený' }, { status: 401 });
    }

    // attach historical orders by billing email
    attachOrdersToUser(user.email, user.id).catch(() => {});

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName
    });

    const session = await getIronSession<SessionData>(request, response, sessionConfig);
    session.customerId = user.id;
    session.isLoggedIn = true;
    await session.save();

    return response;
  } catch (error) {
    console.error('[auth/login] error', error);
    return NextResponse.json({ error: 'Prihlásenie zlyhalo' }, { status: 500 });
  }
}
