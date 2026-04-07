import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { isAutomationAuthorized } from '../../../../lib/automation/config';

const FLAG_KEY = 'reactivation_flow';

export async function GET(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const flag = await prisma.featureFlag.upsert({
    where: { key: FLAG_KEY },
    create: { key: FLAG_KEY, enabled: false, description: 'Reactivation flow 30–45 dní' },
    update: {},
  });

  return NextResponse.json({ enabled: flag.enabled });
}

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { enabled?: boolean } | null;
  if (!body || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const flag = await prisma.featureFlag.upsert({
    where: { key: FLAG_KEY },
    create: { key: FLAG_KEY, enabled: body.enabled, description: 'Reactivation flow 30–45 dní' },
    update: { enabled: body.enabled },
  });

  return NextResponse.json({ enabled: flag.enabled });
}
