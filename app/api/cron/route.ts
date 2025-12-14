import { NextResponse } from 'next/server';
import { runReactivationJob } from '../../lib/newsletter/reactivation-job';

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
  const limit = Number(url.searchParams.get('limit')) || 200;

  const reactivation = await runReactivationJob(limit);

  return NextResponse.json({
    status: 'ok',
    reactivation,
  });
}
