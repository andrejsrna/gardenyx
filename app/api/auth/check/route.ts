import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import prisma from '@/app/lib/prisma';
import { sessionConfig } from '@/app/lib/config/session';
import type { SessionData } from '@/app/lib/config/session';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const response = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, response, sessionConfig);

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const user = await prisma.user.findUnique({ where: { id: session.customerId } });
    if (!user) {
      session.destroy();
      await session.save();
      return NextResponse.json({ isAuthenticated: false });
    }

    return NextResponse.json({
      isAuthenticated: true,
      customerData: {
        id: user.id,
        email: user.email,
        first_name: user.firstName || '',
        last_name: user.lastName || ''
      }
    });
  } catch (error) {
    console.error('[auth/check] error', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
