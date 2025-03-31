import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

const requestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('eur'),
  metadata: z.object({
    order_id: z.string(),
    customer_email: z.string().email().nullish()
  })
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const validatedData = requestSchema.parse(body);
    const amountInCents = Math.round(validatedData.amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: validatedData.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: validatedData.metadata.order_id,
        ...(validatedData.metadata.customer_email && {
          customer_email: validatedData.metadata.customer_email
        })
      },
      statement_descriptor_suffix: 'NKV SHOP',
      ...(validatedData.metadata.customer_email && {
        receipt_email: validatedData.metadata.customer_email
      })
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 400 }
    );
  }
}
