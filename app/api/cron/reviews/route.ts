import { NextResponse } from 'next/server';
import { runReviewRequestJob } from '@/app/lib/reviews/review-request-job';

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
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit')) || 200));

  const result = await runReviewRequestJob(limit);
  return NextResponse.json(result);
}
