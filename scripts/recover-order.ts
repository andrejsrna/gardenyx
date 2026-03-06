import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
});

async function main() {
  const piId = 'pi_3T7BsgK0qUjRbnOC0bvA6gy0';


  const pi = await stripe.paymentIntents.retrieve(piId);
  console.log('PI fetched:', pi.id, pi.status);

  if (pi.status !== 'succeeded') {
    console.log('Not succeeded.');
    return;
  }

  const md = (pi.metadata || {}) as Record<string, string | undefined>;
  
  const parseBase64Json = <T>(value?: string): T | undefined => {
    if (!value) return undefined;
    try {
      return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as T;
    } catch {
      return undefined;
    }
  };

  const cart = parseBase64Json<{ li: Array<{ product_id: number; quantity: number }>; sm: string }>(md.cart_signature);
  const billing = parseBase64Json<Record<string, unknown>>(md.b) || {};
  const shipping = parseBase64Json<Record<string, unknown>>(md.s) || {};
  const metaData = parseBase64Json<Array<{ key: string; value: string }>>(md.md) || [];

  if (!cart?.li?.length) {
    console.error('No cart found in PI metadata!');
    console.log('PI metadata was:', pi.metadata);
    return;
  }

  console.log('Cart:', cart);
  console.log('Billing:', billing);
  
  // Create order via the API payload approach so we reuse all logic
  const payload = {
    status: 'processing',
    transaction_id: pi.id,
    billing,
    shipping,
    payment_method: 'stripe',
    payment_method_title: 'Platba kartou',
    line_items: cart.li.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
    shipping_lines: cart.sm.startsWith('packeta') ? [{
      method_id: cart.sm,
      method_title: 'Packeta',
      total: md.sct || md.sc || '0',
      total_tax: md.sctx || '0'
    }] : [],
    meta_data: [
      { key: '_stripe_payment_intent_id', value: pi.id },
      ...(md.cp ? [{ key: '_coupon_code', value: md.cp }] : []),
      ...(md.da ? [{ key: '_discount_total', value: md.da }] : []),
      ...metaData
    ],
    total: (pi.amount_received || pi.amount || 0) / 100,
    idempotency_key: pi.id + '_recover'
  };

  console.log('Payload for API:', JSON.stringify(payload, null, 2));
}

main()
  .catch(console.error);
