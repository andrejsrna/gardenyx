import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logError } from '../../../../../lib/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly awaited
    const { id } = await Promise.resolve(params);
    if (!id) {
      return NextResponse.json({ error: 'Missing payment intent ID' }, { status: 400 });
    }

    await stripe.paymentIntents.cancel(id);
    console.log(`[Stripe] Payment intent ${id} cancelled successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Stripe Payment Intent Cancel', {
      error,
      orderId: null,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel payment intent' },
      { status: 400 }
    );
  }
} 