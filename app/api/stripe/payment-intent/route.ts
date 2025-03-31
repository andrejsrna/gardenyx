import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

// Check immediately if the key exists at module load time
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('CRITICAL: STRIPE_SECRET_KEY is not defined at module load time.');
  // Optional: throw an error here to prevent the app from even starting if the key is missing
  // throw new Error('STRIPE_SECRET_KEY is not defined');
}

// Initialize Stripe client (will use the env var)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { // Provide fallback empty string if potentially undefined
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
  console.log('[PaymentIntent API] Received POST request');

  // Log the environment variable value *inside* the handler
  const secretKeyAvailable = !!process.env.STRIPE_SECRET_KEY;
  const keyPreview = process.env.STRIPE_SECRET_KEY?.substring(0, 5) + '...'; // Avoid logging full key
  console.log(`[PaymentIntent API] STRIPE_SECRET_KEY available: ${secretKeyAvailable}, Preview: ${keyPreview}`);

  // Re-check key inside handler, return 500 if missing
  if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[PaymentIntent API] STRIPE_SECRET_KEY is missing inside POST handler.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    console.log('[PaymentIntent API] Parsing request body...');
    const body = await request.json();
    console.log('[PaymentIntent API] Request body parsed:', body);

    console.log('[PaymentIntent API] Validating request data...');
    const validatedData = requestSchema.parse(body);
    console.log('[PaymentIntent API] Request data validated:', validatedData);

    const amountInCents = Math.round(validatedData.amount * 100);

    console.log(`[PaymentIntent API] Attempting to create payment intent for order ${validatedData.metadata.order_id} amount ${amountInCents}...`);
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
    console.log(`[PaymentIntent API] Payment intent ${paymentIntent.id} created successfully.`);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('[PaymentIntent API] Error during processing:', error);

    if (error instanceof z.ZodError) {
        console.error('[PaymentIntent API] Validation Error:', error.errors);
        return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error(`[PaymentIntent API] Stripe Error (${error.type}): ${error.message}`);
      // Return 401 specifically for authentication errors
      const status = error.type === 'StripeAuthenticationError' ? 401 : (error.statusCode || 400);
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }

    // Catch other errors (e.g., network issues, JSON parsing)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[PaymentIntent API] Generic Error: ${errorMessage}`);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 } // Use 500 for unexpected server errors
    );
  }
}
