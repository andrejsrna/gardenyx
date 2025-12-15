import { NextResponse } from 'next/server';

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

const handlers: Record<string, string> = {
  reactivation: '/api/cron/reactivation',
  packeta: '/api/cron/packeta',
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const job = url.searchParams.get('job') || 'reactivation';
  const target = handlers[job];

  if (!target) {
    return NextResponse.json({ error: 'Unknown job' }, { status: 400 });
  }

  const targetUrl = new URL(target, url.origin);
  // forward all params except job
  url.searchParams.forEach((value, key) => {
    if (key !== 'job') targetUrl.searchParams.set(key, value);
  });

  const res = await fetch(targetUrl.toString(), {
    method: 'POST',
    headers: {
      'x-admin-token': request.headers.get('x-admin-token') || '',
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ proxied: target, status: res.status, data });
}
