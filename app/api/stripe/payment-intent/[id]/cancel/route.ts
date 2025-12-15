import { logError } from '@/app/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { rateLimit } from '@/app/lib/utils/rateLimit';
import prisma from '@/app/lib/prisma';
import type Stripe from 'stripe';

const stripe = getStripe();

type RouteParams = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  props: { params: RouteParams }
) {
  try {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
    await rateLimit(ip, 'payment');
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing payment intent ID' },
        { status: 400 }
      );
    }

    try {
      let orderId: string | undefined;
      try {
        const pi = await stripe.paymentIntents.retrieve(id);
        const md = (pi.metadata as Stripe.Metadata) || undefined;
        orderId = md ? md['order_id'] : undefined;
      } catch {}

      await stripe.paymentIntents.cancel(id);

      if (orderId) {
        try {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'cancelled',
              paymentStatus: 'failed'
            }
          });
        } catch {}
      }
      return NextResponse.json({ success: true });
    } catch (stripeError: unknown) {
      const err = stripeError as { statusCode?: number; message?: string } | undefined;
      const status = err?.statusCode || 400;
      const message = err?.message || 'Failed to cancel payment intent';
      return NextResponse.json({ error: message }, { status });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel payment intent';
    const errorDetails = {
      error,
      orderId: null,
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.constructor.name : typeof error
    };

    logError('Stripe Payment Intent Cancel', errorDetails);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
