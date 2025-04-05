import { logError } from '@/app/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  timeout: 10000, // 10 second timeout
});

type RouteParams = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  props: { params: RouteParams }
) {
  try {
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing payment intent ID' },
        { status: 400 }
      );
    }

    try {
      await stripe.paymentIntents.cancel(id);
      return NextResponse.json({ success: true });
    } catch (stripeError) {
      console.error('[Stripe] API Error:', stripeError);
      if (stripeError instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { error: stripeError.message },
          { status: stripeError.statusCode || 500 }
        );
      }
      const genericError = new Error(
        stripeError instanceof Error ? stripeError.message : 'Unknown payment intent cancellation error'
      );
      console.error('[Stripe] Non-Stripe Error:', genericError);
      return NextResponse.json(
        { error: genericError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel payment intent';
    const errorDetails = {
      error,
      orderId: null,
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.constructor.name : typeof error
    };

    console.error('[API Error]:', errorDetails);
    logError('Stripe Payment Intent Cancel', errorDetails);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
