import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { ensureOrderFromPaymentIntent, StripePI } from '@/app/api/stripe/webhook/route';
import prisma from '@/app/lib/prisma';

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || request.nextUrl.searchParams.get('token');
  const expected = process.env.NEWSLETTER_ADMIN_TOKEN || process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) return false;
  if (!token) return false;
  return token === expected;
}

export async function POST(request: NextRequest) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    const existing = await prisma.order.findFirst({
      where: {
        OR: [
          { transactionId: paymentIntentId },
          { meta: { some: { key: '_stripe_payment_intent_id', value: paymentIntentId } } }
        ]
      },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json({ 
        message: 'Order already exists', 
        orderId: existing.id 
      });
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ 
        error: `PaymentIntent is not succeeded (status: ${pi.status})` 
      }, { status: 400 });
    }

    const stripePi: StripePI = {
      id: pi.id,
      amount: pi.amount,
      amount_received: pi.amount_received,
      status: pi.status,
      metadata: pi.metadata,
    };

    const orderId = await ensureOrderFromPaymentIntent(stripePi);

    if (!orderId) {
      return NextResponse.json({ error: 'Could not reconstruct order from metadata (missing cart_signature?)' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      orderId 
    });
  } catch (error) {
    console.error('[Recover Order]', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
