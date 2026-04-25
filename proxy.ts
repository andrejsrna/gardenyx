import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit } from './app/lib/utils/rateLimit';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const LOCALES = new Set(['sk', 'en', 'hu']);

const PROTECTED_PATHS: string[] = [];
const ADMIN_PATH_PREFIX = '/admin';
const MAX_PARAM_LENGTH = 250;

// Paths that should bypass rate limiting
const RATE_LIMIT_EXEMPT_PATHS = [
  '/api/auth',
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
  'ad_id', 'pixel', 'key', 'page', 'search', 'tag', 'include', 'locale', 'slug',
  'fbclid', 'fbc', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_term', 'utm_content',
  // Reviews token
  'token',
  // Admin stats filters
  'days',
  // Admin invoice export filters
  'year', 'month',
  // Cron job selector
  'job',
  // Needed for Stripe success + internal lookups
  'id', 'payment_intent', 'payment_intent_client_secret'
]);

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'", "'unsafe-inline'", "'unsafe-eval'",
    'https://*.facebook.net', 'https://*.facebook.com',
    'https://connect.facebook.net', 'https://js.stripe.com',
    'https://www.googletagmanager.com', 'https://www.google-analytics.com',
    'https://widget.packeta.com', 'https://backup.widget.packeta.com', 'https://*.packeta.com',
    'https://maps.googleapis.com', 'https://eu-assets.i.posthog.com'
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: [
    "'self'", 'blob:', 'data:', 'https://*.stripe.com',
    'https://*.facebook.com', 'https://www.facebook.com',
    'https://facebook.com',
    'https://*.googletagmanager.com', 'https://www.googletagmanager.com',
    'https://www.google-analytics.com', 'https://googleads.g.doubleclick.net',
    'https://stats.g.doubleclick.net', 'https://www.google.com',
    'https://*.gstatic.com', 'https://maps.gstatic.com', 'https://upload.wikimedia.org',
    'https://cdn.gardenyx.eu'
  ],
  frameSrc: [
    "'self'", 'https://js.stripe.com', 'https://www.googletagmanager.com',
    'https://widget.packeta.com', 'https://backup.widget.packeta.com', 'https://*.packeta.com',
    'https://www.youtube.com', 'https://youtube.com'
  ],
  connectSrc: [
    "'self'",
    'https://api.stripe.com', 'https://js.stripe.com', 'https://maps.googleapis.com',
    'https://*.facebook.net', 'https://*.facebook.com',
    'https://connect.facebook.net', 'https://*.sentry.io',
    'https://*.ingest.sentry.io', 'https://eu.i.posthog.com',
    'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://region1.google-analytics.com',
    'https://stats.g.doubleclick.net', 'https://googleads.g.doubleclick.net',
    'https://www.google.com',
    'https://widget.packeta.com', 'https://backup.widget.packeta.com', 'https://*.packeta.com'
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
  return !RATE_LIMIT_EXEMPT_PATHS.some(exemptPath =>
    pathname.startsWith(exemptPath) || pathname.includes(exemptPath)
  );
}

function getLocalizedPath(locale: string, route: 'shop' | 'contact' | 'hakofyt' | 'terms' | 'privacy' | 'download' | 'account' | 'register' | 'checkout' | 'blog' | 'product', slug?: string) {
  const prefixes = {
    sk: {
      shop: '/sk/kupit',
      contact: '/sk/kontakt',
      hakofyt: '/sk/hnojiva-hakofyt',
      terms: '/sk/obchodne-podmienky',
      privacy: '/sk/ochrana-osobnych-udajov',
      download: '/sk/stiahnut',
      account: '/sk/moj-ucet',
      register: '/sk/registracia',
      checkout: '/sk/pokladna',
      blog: '/sk/blog',
      product: slug ? `/sk/produkt/${slug}` : '/sk/kupit',
    },
    en: {
      shop: '/en/shop',
      contact: '/en/contact',
      hakofyt: '/en/hakofyt-fertilizers',
      terms: '/en/terms-and-conditions',
      privacy: '/en/privacy-policy',
      download: '/en/download',
      account: '/en/my-account',
      register: '/en/registracia',
      checkout: '/en/checkout',
      blog: '/en/blog',
      product: slug ? `/en/product/${slug}` : '/en/shop',
    },
    hu: {
      shop: '/hu/vasarlas',
      contact: '/hu/kapcsolat',
      hakofyt: '/hu/hakofyt-mutragyak',
      terms: '/hu/aszf',
      privacy: '/hu/adatvedelem',
      download: '/hu/letoltes',
      account: '/hu/fiokom',
      register: '/hu/registracia',
      checkout: '/hu/penztar',
      blog: '/hu/blog',
      product: slug ? `/hu/termek/${slug}` : '/hu/vasarlas',
    },
  } as const;

  return prefixes[locale as keyof typeof prefixes]?.[route] || prefixes.sk[route];
}

function buildRedirectResponse(request: NextRequest, pathname: string, searchParams?: URLSearchParams) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = searchParams?.toString() || '';
  return NextResponse.redirect(url, 308);
}

function getLegacyShopifyRedirect(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  let locale = 'sk';
  let pathSegments = segments;
  if (segments[0] && LOCALES.has(segments[0])) {
    locale = segments[0];
    pathSegments = segments.slice(1);
  }

  const normalizedPath = `/${pathSegments.join('/')}`;
  const first = pathSegments[0];
  const second = pathSegments[1];

  if (normalizedPath === '/pages/contact') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'contact'));
  }
  if (normalizedPath === '/pages/hakofyt-fertilizers') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'hakofyt'));
  }
  if (normalizedPath === '/pages/terms-privacy' || normalizedPath === '/pages/terms-and-conditions' || normalizedPath === '/policies/terms-of-service') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'terms'));
  }
  if (normalizedPath === '/pages/privacy-policy' || normalizedPath === '/policies/privacy-policy') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'privacy'));
  }
  if (normalizedPath === '/pages/download') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'download'));
  }
  if (first === 'products' && second) {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'product', second));
  }
  if (first === 'collections') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'shop'));
  }
  if (first === 'blogs') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'blog'));
  }
  if (first === 'account' && (pathSegments.length === 1 || second === 'login')) {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'account'));
  }
  if (first === 'account' && second === 'register') {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'register'));
  }
  // Skip legacy redirect if this is already the correct localized checkout path
  // e.g. /en/checkout is valid — redirecting it to /en/checkout would loop
  const localizedCheckoutSlugs: Record<string, string> = { sk: 'pokladna', en: 'checkout', hu: 'penztar' };
  const isAlreadyLocalizedCheckout = first === localizedCheckoutSlugs[locale];
  if (!isAlreadyLocalizedCheckout && (first === 'cart' || first === 'checkout')) {
    return buildRedirectResponse(request, getLocalizedPath(locale, 'checkout'));
  }
  if (first === 'search') {
    const nextSearchParams = new URLSearchParams();
    const query = searchParams.get('q')?.trim();
    if (query) nextSearchParams.set('search', query);
    return buildRedirectResponse(request, getLocalizedPath(locale, 'shop'), nextSearchParams);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  try {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders });
    }

    const legacyRedirect = getLegacyShopifyRedirect(request);
    if (legacyRedirect) {
      return legacyRedirect;
    }

    const { pathname } = request.nextUrl;
    const isAdmin = isAdminPath(pathname);
    const isApi = pathname.startsWith('/api');
    let intlRewriteTarget: string | null = null;

    // Run intl locale routing for non-admin, non-API, non-static paths
    const isStaticFile = /\.(?:webp|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|css|js|mp4|webm|pdf)$/i.test(pathname);
    if (!isAdmin && !isApi && !isStaticFile) {
      const intlResponse = intlMiddleware(request);
      // If intl wants to redirect (e.g. / → /sk), return that redirect
      if (intlResponse.status === 307 || intlResponse.status === 308 || intlResponse.headers.get('location')) {
        return intlResponse;
      }
      intlRewriteTarget = intlResponse.headers.get('x-middleware-rewrite');
    }

    if (shouldApplyRateLimit(request.nextUrl.pathname)) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      await rateLimit(ip);
    }

    if (isAdmin) {
      const adminAuthResponse = requireAdminAuth(request);
      if (adminAuthResponse) {
        return adminAuthResponse;
      }
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
      console.error('[Proxy] Request URL is null or undefined');
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
      if (isAdmin) {
        requestHeaders.set('x-admin-route', '1');
      }
      response = intlRewriteTarget
        ? NextResponse.rewrite(intlRewriteTarget, { request: { headers: requestHeaders } })
        : NextResponse.next({ request: { headers: requestHeaders } });

      response.headers.set('Content-Security-Policy', generateCSPHeader());
      Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
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

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_PATH_PREFIX);
}

function requireAdminAuth(request: NextRequest): NextResponse | null {
  const username = process.env.ADMIN_DASHBOARD_USER || 'admin';
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!password) {
    console.warn('[Proxy] ADMIN_DASHBOARD_PASSWORD is not set, admin route will be blocked.');
    return new NextResponse('Admin access not configured', { status: 503 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
      },
    });
  }

  const encoded = authHeader.split(' ')[1] || '';
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
      },
    });
  }
  const [providedUser, providedPass] = decoded.split(':');

  if (providedUser !== username || providedPass !== password) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
      },
    });
  }

  return null;
}
