import { NextResponse } from 'next/server';
import { isAutomationAuthorized } from '@/app/lib/automation/config';

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  void request;
  return NextResponse.json({ status: 'disabled', reason: 'reviews_deactivated' }, { status: 410 });
}
