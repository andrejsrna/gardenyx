import { NextResponse } from 'next/server';
import { runReactivationJob } from '@/app/lib/newsletter/reactivation-job';
import { runReviewRequestJob } from '@/app/lib/reviews/review-request-job';
import * as packetaHandler from './packeta/route';

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const job = url.searchParams.get('job') || 'reactivation';
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit')) || 200));

  const results: Array<{ job: string; status: number; data: unknown }> = [];

  try {
    const runJob = async (key: string) => {
      if (key === 'reactivation') {
        const data = await runReactivationJob(limit);
        results.push({ job: key, status: 200, data });
        return;
      }
      if (key === 'reviews') {
        const data = await runReviewRequestJob(limit);
        results.push({ job: key, status: 200, data });
        return;
      }
      if (key === 'packeta') {
        const res = await packetaHandler.POST(request);
        results.push({ job: key, status: res.status, data: await res.json().catch(() => ({})) });
        return;
      }
      results.push({ job: key, status: 400, data: { error: 'Unknown job' } });
    };

    if (job === 'all') {
      await runJob('reactivation');
      await runJob('packeta');
      await runJob('reviews');
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
