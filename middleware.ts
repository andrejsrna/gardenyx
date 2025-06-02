import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit } from './app/lib/utils/rateLimit';

const PROTECTED_PATHS: string[] = [];
const MAX_PARAM_LENGTH = 250;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

const ALLOWED_PARAMS = new Set([
  'ad_id', 'pixel', 'key', 'page', 'search', 'tag', 'include',
  'fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_term', 'utm_content'
]);

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'", "'unsafe-inline'", "'unsafe-eval'",
    'https://*.facebook.net', 'https://*.facebook.com',
    'https://connect.facebook.net', 'https://js.stripe.com',
    'https://www.googletagmanager.com', 'https://widget.packeta.com',
    'https://backup.widget.packeta.com', 'https://maps.googleapis.com'
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: [
    "'self'", 'blob:', 'data:', 'https://*.stripe.com',
    'https://*.facebook.com', 'https://www.facebook.com',
    'https://facebook.com', 'https://najsilnejsiaklbovavyziva.sk',
    'https://*.googletagmanager.com', 'https://www.googletagmanager.com',
    'https://cdn.najsilnejsiaklbovavyziva.sk', 'https://*.gstatic.com',
    'https://maps.gstatic.com'
  ],
  frameSrc: [
    "'self'", 'https://js.stripe.com',
    'https://widget.packeta.com', 'https://backup.widget.packeta.com'
  ],
  connectSrc: [
    "'self'", 'https://api.stripe.com', 'https://maps.googleapis.com',
    'https://najsilnejsiaklbovavyziva.sk/wp-json/wc/v3/*',
    'https://admin.najsilnejsiaklbovavyziva.sk/wp-json/wp/v2/*',
    'https://*.facebook.net', 'https://*.facebook.com',
    'https://connect.facebook.net', 'https://*.sentry.io',
    'https://*.ingest.sentry.io'
  ],
  fontSrc: ["'self'"],
  workerSrc: ["'self'", 'blob:', 'https://js.stripe.com']
};

function generateCSPHeader() {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${values.join(' ')}`)
    .join('; ');
}

function handleErrorResponse(error: unknown, corsHeaders: Record<string, string>) {
  if (error instanceof Error && error.message.includes('rate limit')) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900',
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

function sanitizeUrlParams(url: URL): URLSearchParams {
  const sanitizedParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (ALLOWED_PARAMS.has(key) && value.length <= MAX_PARAM_LENGTH) {
      sanitizedParams.append(key, value);
    }
  });
  return sanitizedParams;
}

export async function middleware(request: NextRequest) {
  try {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimit(ip);

    if (PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
      return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`);
    }

    const url = new URL(request.url);
    const sanitizedParams = sanitizeUrlParams(url);
    const originalParamsString = url.search ? url.search.substring(1) : '';
    const sanitizedParamsString = sanitizedParams.toString();

    if (originalParamsString !== sanitizedParamsString) {
      const cleanUrl = new URL(url.pathname, url.origin);
      if (sanitizedParamsString) {
        cleanUrl.search = sanitizedParamsString;
      }
      return NextResponse.redirect(cleanUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', generateCSPHeader());
    Object.entries(corsHeaders).forEach(([key, value]) => requestHeaders.set(key, value));

    return NextResponse.next({ headers: requestHeaders });
  } catch (error) {
    return handleErrorResponse(error, corsHeaders);
  }
}

export const config = {
  matcher: ['/:path*', '/xCJW1VKn/:path*']
};
