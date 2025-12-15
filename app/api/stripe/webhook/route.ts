import { NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import prisma from '@/app/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const stripe = getStripe();

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !endpointSecret) {
      return NextResponse.json({ error: 'Invalid webhook config' }, { status: 400 });
    }

    // Use arrayBuffer instead of text() to avoid stream issues
    const rawBody = await request.arrayBuffer();
    const rawBodyBuffer = Buffer.from(rawBody);

    let event: unknown;
    try {
      event = stripe.webhooks.constructEvent(rawBodyBuffer, signature, endpointSecret);
    } catch {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    const typedEvent = event as { type: string; data: { object: unknown } };

    switch (typedEvent.type) {
      case 'payment_intent.succeeded': {
        const pi = typedEvent.data.object as { id: string; amount_received?: number; metadata?: Record<string, string | undefined> };
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          try {
            const order = await prisma.order.findUnique({ where: { id: orderId }, include: { meta: true } });
            if (!order) break;
            const expectedCents = Number(order.total) * 100;
            if (Number.isFinite(expectedCents) && expectedCents > 0 && typeof pi.amount_received === 'number') {
              if (pi.amount_received !== expectedCents) {
                await prisma.order.update({
                  where: { id: orderId },
                  data: {
                    status: OrderStatus.on_hold,
                    meta: { create: { key: '_stripe_amount_received', value: String(pi.amount_received) } }
                  }
                });
                break;
              }
            }
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.processing,
                paymentStatus: PaymentStatus.paid,
                transactionId: pi.id,
                meta: { create: { key: '_stripe_payment_intent_id', value: pi.id } }
              }
            });
          } catch {
          }
        } else {
          // No order id — we rely on finalize flow to create the order. Avoid duplicating here.
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = typedEvent.data.object as { id: string; metadata?: Record<string, string | undefined> };
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          try {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.failed,
                paymentStatus: PaymentStatus.pending,
                customerNote: 'Platba zlyhala. Skúste prosím zaplatiť znova alebo zvoľte iný spôsob.'
              }
            });
          } catch {}
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
