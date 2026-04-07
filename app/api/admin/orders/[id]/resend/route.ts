import { NextRequest, NextResponse } from 'next/server';
import { getAutomationAdminToken } from '@/app/lib/automation/config';
import prisma from '@/app/lib/prisma';
import { finalizeOrder } from '@/app/lib/checkout/finalize-order';

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || request.nextUrl.searchParams.get('token');
  const expected = getAutomationAdminToken();
  if (!expected) return false;
  if (!token) return false;
  return token === expected;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Keep order in processing; force re-send side effects.
  await prisma.order.update({ where: { id }, data: { status: 'processing' } });

  const result = await finalizeOrder(id, { forceEmail: true, forcePacketa: true });

  return NextResponse.json({ orderId: id, status: 'processing', ...result });
}
