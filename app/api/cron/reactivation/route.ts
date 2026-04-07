import { NextResponse } from 'next/server';
import { isAutomationAuthorized, isMarketingAutomationEnabled } from '../../../lib/automation/config';
import { runReactivationJob } from '../../../lib/newsletter/reactivation-job';

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isMarketingAutomationEnabled()) {
    return NextResponse.json({ status: 'disabled' });
  }

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit')) || 200));

  const result = await runReactivationJob(limit);
  return NextResponse.json(result);
}
