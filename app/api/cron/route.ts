import { NextResponse } from 'next/server';

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

const handlers: Record<string, string | string[]> = {
  reactivation: '/api/cron/reactivation',
  packeta: '/api/cron/packeta',
  reviews: '/api/cron/reviews',
  all: ['/api/cron/reactivation', '/api/cron/packeta', '/api/cron/reviews'],
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

  const targets = Array.isArray(target) ? target : [target];
  const results: Array<{ proxied: string; status: number; data: unknown }> = [];

  try {
    for (const path of targets) {
      const targetUrl = new URL(path, url.origin);
      // forward all params except job
      url.searchParams.forEach((value, key) => {
        if (key !== 'job') targetUrl.searchParams.set(key, value);
      });

      try {
        const res = await fetch(targetUrl.toString(), {
          method: 'POST',
          headers: {
            'x-admin-token': request.headers.get('x-admin-token') || '',
          },
        });

        const data = await res.json().catch(() => ({ error: 'No JSON body' }));
        results.push({ proxied: path, status: res.status, data });
      } catch (error) {
        results.push({ proxied: path, status: 500, data: { error: String(error) } });
      }
    }

    return NextResponse.json({
      proxied: targets,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cron proxy failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
