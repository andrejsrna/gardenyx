import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate nonce using Web Crypto API
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://widget.packeta.com https://backup.widget.packeta.com https://connect.facebook.net https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.stripe.com https://najsilnejsiaklbovavyziva.sk;
    frame-src 'self' https://js.stripe.com https://widget.packeta.com https://backup.widget.packeta.com;
    connect-src 'self' https://api.stripe.com https://maps.googleapis.com;
    font-src 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(
    'Content-Security-Policy',
    cspHeader
  );

  return NextResponse.next({
    headers: requestHeaders,
  });
}

export const config = {
  matcher: '/:path*',
} 
