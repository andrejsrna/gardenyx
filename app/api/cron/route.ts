import { NextResponse } from 'next/server';
import { isAutomationAuthorized } from '@/app/lib/automation/config';
import * as packetaHandler from './packeta/route';
import * as finalizeHandler from './finalize/route';

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const job = url.searchParams.get('job') || 'packeta';

  const results: Array<{ job: string; status: number; data: unknown }> = [];

  try {
    const runJob = async (key: string) => {
      if (key === 'reactivation') {
        results.push({ job: key, status: 410, data: { status: 'disabled', reason: 'flows_deactivated' } });
        return;
      }
      if (key === 'reviews') {
        results.push({ job: key, status: 410, data: { status: 'disabled', reason: 'reviews_deactivated' } });
        return;
      }
      if (key === 'guidance') {
        results.push({ job: key, status: 410, data: { status: 'disabled', reason: 'flows_deactivated' } });
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
