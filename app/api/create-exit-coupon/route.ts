import { NextResponse } from 'next/server';

// Prevent client-side access
export const dynamic = 'force-dynamic'; // If using App Router
export const config = {
  runtime: 'edge', // Consider edge runtime for better security
};

// Add rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Get Redis credentials from environment variables
const redisUrl = process.env.REDIS_URL || '';
const redisPassword = process.env.REDIS_PASSWORD || '';

// Extract host and port from Redis URL
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

const url = new URL(redisUrl);
const host = url.hostname;
const port = url.port;

// Create Redis client with Upstash REST API format
const redis = new Redis({
  url: `https://${host}:${port}`,
  token: redisPassword,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute
});

export async function POST(request: Request) {
  const { success } = await ratelimit.limit(request.headers.get('cf-connecting-ip') ?? 'anonymous');
  if (!success) return new Response('Too Many Requests', { status: 429 });

  return NextResponse.json(
    { error: 'Kupóny sú deaktivované' },
    { status: 410 }
  );
}
