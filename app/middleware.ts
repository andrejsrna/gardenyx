import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/utils/rateLimit';

// Paths that require API key authentication
const PROTECTED_PATHS = [
  '/api/woocommerce',
  '/api/stripe',
];

export async function middleware(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimit(ip);

    // API key authentication for protected paths
    if (PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      const apiKey = request.headers.get('x-api-key');
      
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    // HTTPS only in production
    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
      return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`);
    }

    return NextResponse.next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit')) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes
          }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export const config = {
  matcher: '/api/:path*'
}; 