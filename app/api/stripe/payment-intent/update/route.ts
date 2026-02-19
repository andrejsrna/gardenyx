import { NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';

// NOTE: initialize Stripe inside the handler so build doesn't fail when env vars are missing

export async function POST(request: Request) {
  const stripe = getStripe();
  try {
    const { paymentIntentId, orderId } = await request.json();

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        order_id: orderId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update payment intent' },
      { status: 400 }
    );
  }
}
