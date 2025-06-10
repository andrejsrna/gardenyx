import { NextRequest, NextResponse } from 'next/server';
import { getRateLimitStatus } from '@/app/lib/utils/rateLimit';

export async function GET(request: NextRequest) {
  // Only allow in development or with proper auth
  if (process.env.NODE_ENV === 'production') {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.DEBUG_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const type = request.nextUrl.searchParams.get('type') || 'default';

  try {
    const status = await getRateLimitStatus(ip, type as 'default' | 'payment' | 'auth');
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      requestIp: ip,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get rate limit status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 