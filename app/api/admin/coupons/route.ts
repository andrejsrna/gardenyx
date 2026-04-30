import { NextRequest, NextResponse } from 'next/server';
import { getAutomationAdminToken } from '@/app/lib/automation/config';
import prisma from '@/app/lib/prisma';

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || request.nextUrl.searchParams.get('token');
  const expected = getAutomationAdminToken();
  return !!(expected && token && token === expected);
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const coupons = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      code: string;
      description: string | null;
      type: string;
      amount: string | null;
      percent: number | null;
      freeShipping: boolean;
      active: boolean;
      startsAt: Date | null;
      endsAt: Date | null;
      minOrderTotal: string | null;
      maxUses: number | null;
      usedCount: number;
      maxUsesPerEmail: number | null;
      createdAt: Date;
    }>
  >('SELECT * FROM "Coupon" ORDER BY "createdAt" DESC');

  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    code,
    description,
    type,
    amount,
    percent,
    freeShipping = false,
    active = true,
    startsAt,
    endsAt,
    minOrderTotal,
    maxUses,
    maxUsesPerEmail,
  } = body;

  if (!code || !type || !['percent', 'fixed'].includes(type)) {
    return NextResponse.json({ error: 'Chýba kód alebo typ kupónu' }, { status: 400 });
  }

  const normalizedCode = String(code).trim().toUpperCase();

  const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    'SELECT id FROM "Coupon" WHERE code = $1 LIMIT 1',
    normalizedCode
  );
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Kupón s týmto kódom už existuje' }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const now = new Date();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Coupon" (id, code, description, type, amount, percent, "freeShipping", active, "startsAt", "endsAt", "minOrderTotal", "maxUses", "usedCount", "maxUsesPerEmail", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,0,$13,$14,$14)`,
    id,
    normalizedCode,
    description || null,
    type,
    type === 'fixed' && amount != null ? String(Number(amount).toFixed(2)) : null,
    type === 'percent' && percent != null ? Number(percent) : null,
    freeShipping,
    active,
    startsAt ? new Date(startsAt) : null,
    endsAt ? new Date(endsAt) : null,
    minOrderTotal != null ? String(Number(minOrderTotal).toFixed(2)) : null,
    maxUses != null ? Number(maxUses) : null,
    maxUsesPerEmail != null ? Number(maxUsesPerEmail) : null,
    now
  );

  return NextResponse.json({ success: true, id, code: normalizedCode });
}

export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, active } = body;

  if (!id || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'Chýba id alebo active' }, { status: 400 });
  }

  await prisma.$executeRawUnsafe(
    'UPDATE "Coupon" SET active = $1, "updatedAt" = now() WHERE id = $2',
    active,
    id
  );

  return NextResponse.json({ success: true });
}
