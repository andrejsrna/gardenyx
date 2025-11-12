import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit } from './app/lib/utils/rateLimit';

const PROTECTED_PATHS: string[] = [];
const MAX_PARAM_LENGTH = 250;

// Paths that should bypass rate limiting
const RATE_LIMIT_EXEMPT_PATHS = [
  '/api/auth',
  '/api/create-exit-coupon',
  '/_next',
  '/favicon.ico',
  '/images',
  '/public',
  '.css',
  '.js',
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

const ALLOWED_PARAMS = new Set([
  'ad_id', 'pixel', 'key', 'page', 'search', 'tag', 'include',
  'fbclid', 'fbc', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_term', 'utm_content',
  // Needed for Stripe success + internal lookups
  'id', 'payment_intent', 'payment_intent_client_secret'
]);

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'", "'unsafe-inline'", "'unsafe-eval'",
    'https://*.facebook.net', 'https://*.facebook.com',
    'https://connect.facebook.net', 'https://js.stripe.com',
    'https://www.googletagmanager.com', 'https://widget.packeta.com',
    'https://backup.widget.packeta.com', 'https://maps.googleapis.com'
    , 'https://eu-assets.i.posthog.com'
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: [
    "'self'", 'blob:', 'data:', 'https://*.stripe.com',
    'https://*.facebook.com', 'https://www.facebook.com',
    'https://facebook.com', 'https://najsilnejsiaklbovavyziva.sk',
    'https://*.googletagmanager.com', 'https://www.googletagmanager.com',
    'https://cdn.najsilnejsiaklbovavyziva.sk', 'https://*.gstatic.com',
    'https://maps.gstatic.com', 'https://upload.wikimedia.org'
  ],
  frameSrc: [
    "'self'", 'https://js.stripe.com',
    'https://widget.packeta.com', 'https://backup.widget.packeta.com',
    'https://www.youtube.com', 'https://youtube.com'
  ],
  connectSrc: [
    "'self'", 'https://api.stripe.com', 'https://maps.googleapis.com',
    'https://najsilnejsiaklbovavyziva.sk/wp-json/wc/v3/*',
    'https://admin.najsilnejsiaklbovavyziva.sk',
    'https://*.facebook.net', 'https://*.facebook.com',
    'https://connect.facebook.net', 'https://*.sentry.io',
    'https://*.ingest.sentry.io', 'https://eu.i.posthog.com'
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
      JSON.stringify({ 
        error: 'Too many requests',
        message: 'Please wait a moment before trying again',
        retryAfter: 60 // seconds
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
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

function shouldApplyRateLimit(pathname: string): boolean {
  // Skip rate limiting for static assets and exempt paths
  return !RATE_LIMIT_EXEMPT_PATHS.some(exemptPath => 
    pathname.startsWith(exemptPath) || pathname.includes(exemptPath)
  );
}

export async function middleware(request: NextRequest) {
  try {
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      if (url.protocol === 'http:') {
        url.protocol = 'https:';
        return NextResponse.redirect(url);
      }
    }

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders });
    }

    // Only apply rate limiting to dynamic routes and API endpoints
    if (shouldApplyRateLimit(request.nextUrl.pathname)) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      await rateLimit(ip);
    }

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

    if (!request.url) {
      console.error('[Middleware] Request URL is null or undefined');
      return NextResponse.next();
    }

    const url = new URL(request.url);
    const fbclidParam = url.searchParams.get('fbclid');
    const fbcParam = url.searchParams.get('fbc');
    const existingFbc = request.cookies.get('_fbc')?.value;
    const sanitizedParams = sanitizeUrlParams(url);
    const originalParamsString = url.search ? url.search.substring(1) : '';
    const sanitizedParamsString = sanitizedParams.toString();

    let response: NextResponse;
    if (originalParamsString !== sanitizedParamsString) {
      const cleanUrl = new URL(url.pathname, url.origin);
      if (sanitizedParamsString) {
        cleanUrl.search = sanitizedParamsString;
      }
      response = NextResponse.redirect(cleanUrl);
    } else {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-nonce', nonce);
      requestHeaders.set('Content-Security-Policy', generateCSPHeader());
      Object.entries(corsHeaders).forEach(([key, value]) => requestHeaders.set(key, value));
      response = NextResponse.next({ headers: requestHeaders });
    }

    const derivedFbc = deriveFbcValue(fbclidParam, fbcParam, existingFbc);
    if (derivedFbc && derivedFbc !== existingFbc) {
      response.cookies.set({
        name: '_fbc',
        value: derivedFbc,
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        secure: url.protocol === 'https:',
        maxAge: 60 * 60 * 24 * 90, // 90 days recommended by Meta
      });
    }

    return response;
  } catch (error) {
    return handleErrorResponse(error, corsHeaders);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public|.*\\.(?:css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$).*)',
  ],
};

function deriveFbcValue(
  fbclidParam: string | null,
  fbcParam: string | null,
  existingFbc: string | undefined,
): string | null {
  if (fbcParam && isValidFbc(fbcParam)) {
    return fbcParam;
  }

  if (fbclidParam && isValidFbclid(fbclidParam)) {
    const timestamp = Math.floor(Date.now() / 1000);
    return `fb.1.${timestamp}.${fbclidParam}`;
  }

  return existingFbc ?? null;
}

function isValidFbclid(value: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(value) && value.length <= MAX_PARAM_LENGTH;
}

function isValidFbc(value: string): boolean {
  return /^fb\.1\.\d+\.[A-Za-z0-9._-]+$/.test(value) && value.length <= MAX_PARAM_LENGTH;
}
