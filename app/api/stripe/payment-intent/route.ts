import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: Request) {
  try {
    const { amount, currency = 'eur' } = await request.json();
    
    console.log('Processing payment intent request:', { 
      amount, 
      currency, 
      type: typeof amount,
      isNumber: typeof amount === 'number',
      isValid: !isNaN(amount) && amount > 0
    });

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount provided:', { 
        amount, 
        type: typeof amount, 
        isNaN: isNaN(amount),
        isPositive: amount > 0 
      });
      return NextResponse.json(
        { error: 'Invalid amount provided. Amount must be a positive number.' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    console.log('Creating Stripe payment intent with:', {
      amount,
      currency,
      automatic_payment_methods: { enabled: true, allow_redirects: 'always' }
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: 'automatic',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
    });

    console.log('Payment intent created successfully:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      hasClientSecret: !!paymentIntent.client_secret
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe payment intent creation error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the payment intent.' },
      { status: 500 }
    );
  }
} 