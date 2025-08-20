import { NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

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
    const body = await request.json().catch(() => ({}));
    if (!request.url) {
      return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
    }
    const url = new URL(request.url);
    const id = body.id || url.searchParams.get('id');
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    
    const pi = await stripe.paymentIntents.retrieve(id);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not succeeded' }, { status: 400 });
    }

    // Check if we're already creating an order for this payment intent
    if (creatingByPi.has(pi.id)) {
      return NextResponse.json({ error: 'Already processing' }, { status: 409 });
    }

    try {
      const existing = await api.get('orders', {
        per_page: 100,
        orderby: 'date',
        order: 'desc',
        status: ['pending', 'processing', 'on-hold', 'completed']
      });
      const orders = Array.isArray(existing.data) ? existing.data as Array<{ id: number; transaction_id?: string; meta_data?: Array<{ key: string; value: string }> }> : [];
      const match = orders.find(o => o.transaction_id === pi.id || o.meta_data?.some(m => m.key === '_stripe_payment_intent_id' && m.value === pi.id));
      if (match?.id) {
        return NextResponse.json({ orderId: match.id });
      }
    } catch {
      return NextResponse.json({ error: 'Order check failed' }, { status: 503 });
    }

    const md = (pi.metadata || {}) as Record<string, string | undefined>;
    const cartSignature = md.cart_signature;
    if (!cartSignature) {
      return NextResponse.json({ error: 'Missing cart signature' }, { status: 400 });
    }
    
    // Mark that we're creating an order for this payment intent
    creatingByPi.add(pi.id);
    
    try {
      const decoded = JSON.parse(Buffer.from(cartSignature, 'base64').toString('utf8')) as { li: Array<{ product_id: number; quantity: number }>; sm: string; d: number };
      const b = md.b ? JSON.parse(Buffer.from(md.b, 'base64').toString('utf8')) : undefined;
      const s = md.s ? JSON.parse(Buffer.from(md.s, 'base64').toString('utf8')) : undefined;
      const ib = md.ib === 'true';
      const mc = md.mc === 'true';
      const cn = md.cn || '';
      const metaData = md.md ? JSON.parse(Buffer.from(md.md, 'base64').toString('utf8')) : [];
      const sc = typeof md.sc === 'string' ? md.sc : '0.00'; // gross shipping
      const sct = typeof md.sct === 'string' ? md.sct : undefined; // net shipping
      const sctx = typeof md.sctx === 'string' ? md.sctx : undefined; // shipping tax
      


      const created = await api.post('orders', {
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
          total: sct || (Number(sc) / 1.19).toFixed(2),
          total_tax: sctx || (Number(sc) * 0.19 / 1.19).toFixed(2),
          taxes: []
        }] : [],
        meta_data: [
          { key: '_stripe_payment_intent_id', value: pi.id },
          ...(ib ? [{ key: 'billing_ic', value: b?.ic || '' }, { key: 'billing_dic', value: b?.dic || '' }, { key: 'billing_dic_dph', value: b?.dic_dph || '' }] : []),
          ...(mc ? [{ key: '_marketing_consent', value: 'yes' }] : []),
          ...(cn ? [{ key: '_customer_note', value: cn }] : []),
          ...metaData
        ]
      });
      const orderId = created.data?.id as number | undefined;
      if (!orderId) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
      return NextResponse.json({ orderId });
    } catch {
      return NextResponse.json({ error: 'Finalize failed' }, { status: 500 });
    } finally {
      // Always remove from the set when we're done
      creatingByPi.delete(pi.id);
    }
  } catch {
    return NextResponse.json({ error: 'Finalize failed' }, { status: 500 });
  }
}


