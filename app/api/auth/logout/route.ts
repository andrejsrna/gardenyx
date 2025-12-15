import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionConfig } from '@/app/lib/config/session';
import type { SessionData } from '@/app/lib/config/session';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  const session = await getIronSession<SessionData>(request, response, sessionConfig);
  session.destroy();
  await session.save();
  response.cookies.set('customerId', '', { maxAge: 0 });
  response.cookies.set('customerToken', '', { maxAge: 0 });
  response.cookies.set('customerName', '', { maxAge: 0 });
  response.cookies.set('wcCustomerToken', '', { maxAge: 0 });
  return response;
}
