import { z } from 'zod';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/app/lib/utils/rateLimit';
import { handleError, AppError } from '@/app/lib/utils/errorHandler';

const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default('eur'),
  metadata: z.object({
    order_id: z.string().optional(),
    customer_email: z.string().email()
  }).optional()
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: Request) {
  try {
    // Apply rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await rateLimit(ip, 'payment');

    // Validate input
    const body = await req.json();
    const validatedData = paymentIntentSchema.parse(body);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError(
        'Stripe configuration missing',
        'STRIPE_CONFIG_ERROR',
        500
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: validatedData.amount,
      currency: validatedData.currency,
      metadata: validatedData.metadata,
      capture_method: 'automatic',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return handleError(error);
  }
} 