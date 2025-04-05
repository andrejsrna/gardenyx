import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit } from './app/lib/utils/rateLimit';

// Paths that require API key authentication
const PROTECTED_PATHS: string[] = [
  // '/api/stripe', // Temporarily removed - payment intent uses Stripe secret key, not generic API key
];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// List of allowed URL parameters
const ALLOWED_PARAMS = new Set(['ad_id', 'pixel', 'key', 'page', 'search']);

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

    // Generate nonce using Web Crypto API for CSP
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    /* Commented out for testing
    // Comprehensive CSP header
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://widget.packeta.com https://backup.widget.packeta.com https://connect.facebook.net https://maps.googleapis.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.stripe.com https://*.facebook.com https://www.facebook.com https://facebook.com https://najsilnejsiaklbovavyziva.sk;
      frame-src 'self' https://js.stripe.com https://widget.packeta.com https://backup.widget.packeta.com;
      connect-src 'self'
        https://api.stripe.com
        https://maps.googleapis.com
        https://najsilnejsiaklbovavyziva.sk/wp-json/wc/v3/*
        https://*.sentry.io
        https://*.ingest.sentry.io;
      font-src 'self';
      worker-src 'self' blob: https://js.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim();
    */

    // HTTPS only in production
    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
      return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`);
    }

    // URL Parameter sanitization
    const url = new URL(request.url);
    const sanitizedParams = new URLSearchParams();

    url.searchParams.forEach((value, key) => {
      if (ALLOWED_PARAMS.has(key) && value.length <= MAX_PARAM_LENGTH) {
        sanitizedParams.append(key, value);
      }
    });

    // If parameters were sanitized, redirect to clean URL
    const originalParamsString = url.search ? url.search.substring(1) : '';
    const sanitizedParamsString = sanitizedParams.toString();

    if (originalParamsString !== sanitizedParamsString) {
      console.log(`[Middleware] Sanitizing params: ${originalParamsString} -> ${sanitizedParamsString}`);
      const cleanUrl = new URL(url.pathname, url.origin);
      if (sanitizedParams.toString()) {
        cleanUrl.search = sanitizedParams.toString();
      }
      return NextResponse.redirect(cleanUrl);
    }

    // Create response with headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    // requestHeaders.set('Content-Security-Policy', cspHeader); // Commented out for testing

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      requestHeaders.set(key, value);
    });

    return NextResponse.next({
      headers: requestHeaders,
    });

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

// Combine the matchers from both files
export const config = {
  matcher: [
    '/:path*',  // Apply to all routes for CSP
    '/xCJW1VKn/:path*',  // Specific path that needed URL sanitization
  ],
};
