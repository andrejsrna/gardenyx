import { NextResponse } from 'next/server';
import { isAutomationAuthorized } from '../../../../lib/automation/config';

export async function GET(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ status: 'disabled', reason: 'flows_deactivated' }, { status: 410 });
}

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  void request;
  return NextResponse.json({ status: 'disabled', reason: 'flows_deactivated' }, { status: 410 });
}
