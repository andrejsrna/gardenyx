import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/utils/rateLimit';

// Paths that require API key authentication
const PROTECTED_PATHS = [
  '/api/stripe',  // Remove WooCommerce from protected paths as it uses its own auth
];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// List of allowed URL parameters
const ALLOWED_PARAMS = new Set(['ad_id', 'pixel', 'key']);

// Maximum allowed length for parameter values
const MAX_PARAM_LENGTH = 100;

export async function middleware(request: NextRequest) {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimit(ip);

    // API key authentication for protected paths (excluding WooCommerce)
    if (PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      const apiKey = request.headers.get('x-api-key');

      if (!apiKey || apiKey !== process.env.API_KEY) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
    }

    // HTTPS only in production
    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
      return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`);
    }

    // Add CORS headers to all responses
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    const url = new URL(request.url);

    // Create a new URLSearchParams for sanitized parameters
    const sanitizedParams = new URLSearchParams();

    // Iterate through parameters and only keep allowed ones with valid lengths
    url.searchParams.forEach((value, key) => {
      if (ALLOWED_PARAMS.has(key) && value.length <= MAX_PARAM_LENGTH) {
        sanitizedParams.append(key, value);
      }
    });

    // If parameters were sanitized, redirect to clean URL
    if (url.search !== sanitizedParams.toString()) {
      const cleanUrl = new URL(url.pathname, url.origin);
      if (sanitizedParams.toString()) {
        cleanUrl.search = sanitizedParams.toString();
      }
      return NextResponse.redirect(cleanUrl);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit')) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900', // 15 minutes
            ...corsHeaders
          }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

export const config = {
  matcher: [
    // Add paths that need URL sanitization
    '/xCJW1VKn/:path*',
    // Add other paths as needed
  ],
};
