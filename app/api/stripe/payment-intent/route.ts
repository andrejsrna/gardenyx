import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: Request) {
  try {
    const { amount, currency = 'eur' } = await request.json();
    
    console.log('Received payment intent request:', { amount, currency, type: typeof amount });

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', { amount, type: typeof amount, isNaN: isNaN(amount) });
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    // Amount is already in cents from the client
    console.log('Creating payment intent with amount in cents:', amount);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency,
      payment_method_types: ['card'],
      capture_method: 'automatic',
      automatic_payment_methods: {
        enabled: false,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
} 