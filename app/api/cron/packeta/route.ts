import { NextResponse } from 'next/server';
import { isAutomationAuthorized } from '@/app/lib/automation/config';
import { syncOrderPacketaStatuses } from '@/app/lib/packeta-sync';

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ ok: true, ...(await syncOrderPacketaStatuses()) });
  } catch (error) {
    console.error('[packeta sync] error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
