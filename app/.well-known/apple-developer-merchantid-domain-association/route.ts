import { NextResponse } from 'next/server';

// Apple Pay domain verification file served by Stripe.
// File content is fetched from Stripe's CDN so it stays up-to-date automatically.
export async function GET() {
  try {
    const res = await fetch(
      'https://stripe.com/files/apple-pay/apple-developer-merchantid-domain-association',
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) {
      return new NextResponse('Not found', { status: 404 });
    }
    const text = await res.text();
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch {
    return new NextResponse('Error', { status: 500 });
  }
}
