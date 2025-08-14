import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { getStripe } from '@/app/lib/stripe';

const stripe = getStripe();

const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !endpointSecret) {
      return NextResponse.json({ error: 'Invalid webhook config' }, { status: 400 });
    }

    const rawBody = await request.text();

    let event: unknown;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
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
            const orderResponse = await api.get(`orders/${orderId}`);
            const order = orderResponse.data as { total?: string };
            const total = Number(order.total || '0');
            const expectedCents = Math.round(total * 100);
            if (Number.isFinite(expectedCents) && expectedCents > 0 && typeof pi.amount_received === 'number') {
              if (pi.amount_received !== expectedCents) {
                try {
                  await api.put(`orders/${orderId}`, {
                    status: 'on-hold',
                    customer_note: 'Detegovaný nesúlad sumy medzi Woo a Stripe, prosím skontrolujte.',
                    meta_data: [
                      { key: '_stripe_amount_received', value: String(pi.amount_received) }
                    ]
                  });
                } catch {}
                break;
              }
            }
            await api.put(`orders/${orderId}`, {
              status: 'processing',
              meta_data: [
                { key: '_stripe_payment_intent_id', value: pi.id }
              ]
            });
          } catch {}
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = typedEvent.data.object as { id: string; metadata?: Record<string, string | undefined> };
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          try {
            await api.put(`orders/${orderId}`, {
              status: 'failed',
              customer_note: 'Platba zlyhala. Skúste prosím zaplatiť znova alebo zvoľte iný spôsob.'
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


