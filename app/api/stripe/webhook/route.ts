import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { getStripe } from '@/app/lib/stripe';

const stripe = getStripe();
const creatingByPi = new Set<string>();

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
            const totalAmount = Number(order.total || '0');
            const expectedCents = Math.round(totalAmount * 100);
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
              transaction_id: pi.id,
              meta_data: [
                { key: '_stripe_payment_intent_id', value: pi.id }
              ]
            });
            
          } catch {  }
        } else {
          try {
            const cartSignature = pi.metadata?.cart_signature;
            if (!cartSignature) { 
               
              break; 
            }
            if (creatingByPi.has(pi.id)) {
              
              break;
            }
            creatingByPi.add(pi.id);
            try {
              
              const existing = await api.get('orders', {
                per_page: 100,
                orderby: 'date',
                order: 'desc',
                status: ['pending', 'processing', 'on-hold', 'completed']
              });
              const orders = Array.isArray(existing.data) ? existing.data as Array<{ id: number; transaction_id?: string; meta_data?: Array<{ key: string; value: string }> }> : [];
              const match = orders.find(o => o.transaction_id === pi.id || o.meta_data?.some(m => m.key === '_stripe_payment_intent_id' && m.value === pi.id));
              if (match?.id) break;
            } catch {
              break;
            }
            const decoded = JSON.parse(Buffer.from(cartSignature, 'base64').toString('utf8')) as { li: Array<{ product_id: number; quantity: number }>; sm: string; d: number };
            const b = pi.metadata?.b ? JSON.parse(Buffer.from(pi.metadata.b, 'base64').toString('utf8')) : undefined;
            const s = pi.metadata?.s ? JSON.parse(Buffer.from(pi.metadata.s, 'base64').toString('utf8')) : undefined;
            const ib = pi.metadata?.ib === 'true';
            const mc = pi.metadata?.mc === 'true';
            const cn = pi.metadata?.cn || '';
            const md = pi.metadata?.md ? JSON.parse(Buffer.from(pi.metadata.md, 'base64').toString('utf8')) : [];
            


            await api.post('orders', {
              status: 'processing',
              transaction_id: pi.id,
              billing: b,
              shipping: s,
              payment_method: 'stripe',
              payment_method_title: 'Platba kartou',
              line_items: decoded.li.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
              shipping_lines: decoded.sm === 'packeta_pickup' || decoded.sm === 'packeta_home' ? [{
                method_id: decoded.sm,
                method_title: decoded.sm === 'packeta_pickup' ? 'Packeta - Výdajné miesto' : 'Packeta - Doručenie domov',
                total: '0.00'
              }] : [],
              meta_data: [
                { key: '_stripe_payment_intent_id', value: pi.id },
                ...(ib ? [{ key: 'billing_ic', value: b?.ic || '' }, { key: 'billing_dic', value: b?.dic || '' }, { key: 'billing_dic_dph', value: b?.dic_dph || '' }] : []),
                ...(mc ? [{ key: '_marketing_consent', value: 'yes' }] : []),
                ...(cn ? [{ key: '_customer_note', value: cn }] : []),
                ...md
              ]
            });
            
          } catch {  }
          finally {
            creatingByPi.delete(pi.id);
          }
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


