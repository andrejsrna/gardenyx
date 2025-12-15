/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function DELETE(_request: NextRequest, context: any) {
  try {
    const { id } = context?.params || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin-delete-order] error', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
