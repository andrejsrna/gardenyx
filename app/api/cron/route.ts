import { NextResponse } from 'next/server';
import { runReactivationJob } from '@/app/lib/newsletter/reactivation-job';
import { runGuidanceCheckinJob } from '@/app/lib/orders/guidance-checkin-job';
import { isAutomationAuthorized, isMarketingAutomationEnabled } from '@/app/lib/automation/config';
import * as packetaHandler from './packeta/route';
import * as finalizeHandler from './finalize/route';

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const job = url.searchParams.get('job') || 'packeta';
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit')) || 200));

  const results: Array<{ job: string; status: number; data: unknown }> = [];

  try {
    const runJob = async (key: string) => {
      if (key === 'reactivation') {
        if (!isMarketingAutomationEnabled()) {
          results.push({ job: key, status: 200, data: { status: 'disabled' } });
          return;
        }
        const data = await runReactivationJob(limit);
        results.push({ job: key, status: 200, data });
        return;
      }
      if (key === 'reviews') {
        results.push({ job: key, status: 410, data: { status: 'disabled', reason: 'reviews_deactivated' } });
        return;
      }
      if (key === 'guidance') {
        if (!isMarketingAutomationEnabled()) {
          results.push({ job: key, status: 200, data: { status: 'disabled' } });
          return;
        }
        const data = await runGuidanceCheckinJob(limit);
        results.push({ job: key, status: 200, data });
        return;
      }
      if (key === 'packeta') {
        const res = await packetaHandler.POST(request);
        results.push({ job: key, status: res.status, data: await res.json().catch(() => ({})) });
        return;
      }
      if (key === 'finalize') {
        const res = await finalizeHandler.POST(request);
        results.push({ job: key, status: res.status, data: await res.json().catch(() => ({})) });
        return;
      }
      results.push({ job: key, status: 400, data: { error: 'Unknown job' } });
    };

    if (job === 'all') {
      await runJob('finalize');
      await runJob('packeta');
    } else {
      await runJob(job);
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cron handler failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
