import { NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';

const stripe = getStripe();

export async function POST(request: Request) {
  try {
    const { paymentIntentId, orderId } = await request.json();

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        order_id: orderId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment intent update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update payment intent' },
      { status: 400 }
    );
  }
}
