import { NextResponse } from 'next/server';

// Prevent client-side access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Add rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function getRateLimiter() {
  const redisUrl = process.env.REDIS_URL || '';
  const redisPassword = process.env.REDIS_PASSWORD || '';

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  const url = new URL(redisUrl);
  const host = url.hostname;
  const port = url.port;

  const redis = new Redis({
    url: `https://${host}:${port}`,
    token: redisPassword,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
  });
}

export async function POST(request: Request) {
  const ratelimit = getRateLimiter();
  const { success } = await ratelimit.limit(request.headers.get('cf-connecting-ip') ?? 'anonymous');
  if (!success) return new Response('Too Many Requests', { status: 429 });

  return NextResponse.json(
    { error: 'Kupóny sú deaktivované' },
    { status: 410 }
  );
}
