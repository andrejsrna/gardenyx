import { NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { isSalesSuspended, getSalesSuspensionMessage } from '@/app/lib/utils/sales-suspension';
import prisma from '../../../lib/prisma';
import { upsertBrevoContact } from '../../../lib/newsletter/brevo';
import { getProductsByIds } from '@/app/lib/products';
// Emails + Packeta are handled by /api/orders finalizeOrder step.
import { recordCouponRedemption } from '@/app/lib/coupons';
import { SHIPPING_VAT_RATE } from '@/app/lib/pricing/constants';
import { netFromGross, taxFromGross } from '@/app/lib/pricing/math';

// NOTE: initialize Stripe inside the handler so build doesn't fail when env vars are missing
const creatingByPi = new Set<string>();

export async function POST(request: Request) {
  const stripe = getStripe();
  try {
    // Check if sales are suspended
    if (isSalesSuspended()) {
      return NextResponse.json(
        { error: getSalesSuspensionMessage() },
        { status: 503 }
      );
    }

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
      const existing = await prisma.order.findFirst({
        where: {
          OR: [
            { transactionId: pi.id },
            { meta: { some: { key: '_stripe_payment_intent_id', value: pi.id } } }
          ]
        },
        select: { id: true }
      });
      if (existing?.id) {
        return NextResponse.json({ orderId: existing.id });
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
      const decoded = JSON.parse(Buffer.from(cartSignature, 'base64').toString('utf8')) as { li: Array<{ product_id: number; quantity: number }>; sm: string; d?: number; cp?: string | null; fs?: boolean };
      const b = md.b ? JSON.parse(Buffer.from(md.b, 'base64').toString('utf8')) : undefined;
      const s = md.s ? JSON.parse(Buffer.from(md.s, 'base64').toString('utf8')) : undefined;
      const ib = md.ib === 'true';
      const mc = md.mc === 'true';
      const cn = md.cn || '';
      const metaData = md.md ? JSON.parse(Buffer.from(md.md, 'base64').toString('utf8')) : [];
      const sc = typeof md.sc === 'string' ? md.sc : '0.00'; // gross shipping
      const sct = typeof md.sct === 'string' ? md.sct : undefined; // net shipping
      const sctx = typeof md.sctx === 'string' ? md.sctx : undefined; // shipping tax
      const couponCode = (md.cp || decoded.cp || '').trim() || undefined;
      const discountTotal = Number(md.da || decoded.d || 0);
      const freeShippingCoupon = md.fs === '1' || decoded.fs === true;
      const couponType = md.cpt || undefined;
      const couponAmountRaw = md.cpa ? Number(md.cpa) : undefined;
      const productIds = decoded.li.map(i => i.product_id);
      const products = await getProductsByIds(productIds);
      const priceMap = new Map<number, { price: number; name: string; sku?: string | null }>();
      for (const p of products) {
        priceMap.set(p.id, { price: Number(p.price || 0), name: p.name, sku: p.sku || null });
      }

      const lineItems = decoded.li.map(i => {
        const data = priceMap.get(i.product_id);
        const price = data ? data.price : 0;
        const total = price * i.quantity;
        return {
          product_id: i.product_id,
          quantity: i.quantity,
          price,
          total,
          name: data?.name || `Product ${i.product_id}`,
          sku: data?.sku || undefined
        };
      });

      const payload = {
        status: 'processing',
        transaction_id: pi.id,
        billing: b,
        shipping: s,
        payment_method: 'stripe',
        payment_method_title: 'Platba kartou',
        line_items: lineItems,
        shipping_lines: decoded.sm === 'packeta_pickup' || decoded.sm === 'packeta_home' ? [{
          method_id: decoded.sm,
          method_title: decoded.sm === 'packeta_pickup' ? 'Packeta - Výdajné miesto' : 'Packeta - Doručenie domov',
          total: sct || netFromGross(Number(sc), SHIPPING_VAT_RATE).toFixed(2),
          total_tax: sctx || taxFromGross(Number(sc), SHIPPING_VAT_RATE).toFixed(2),
          taxes: []
        }] : [],
        meta_data: [
          { key: '_stripe_payment_intent_id', value: pi.id },
          ...(ib ? [{ key: 'billing_ic', value: b?.ic || '' }, { key: 'billing_dic', value: b?.dic || '' }, { key: 'billing_dic_dph', value: b?.dic_dph || '' }] : []),
          ...(mc ? [{ key: '_marketing_consent', value: 'yes' }] : []),
          ...(cn ? [{ key: '_customer_note', value: cn }] : []),
          ...(couponCode ? [{ key: '_coupon_code', value: couponCode }] : []),
          ...(Number.isFinite(discountTotal) && discountTotal > 0 ? [{ key: '_discount_total', value: discountTotal.toFixed(2) }] : []),
          ...(couponType ? [{ key: '_coupon_type', value: couponType }] : []),
          ...(couponAmountRaw !== undefined ? [{ key: '_coupon_value', value: String(couponAmountRaw) }] : []),
          ...(freeShippingCoupon ? [{ key: '_coupon_free_shipping', value: 'true' }] : []),
          ...metaData
        ],
        total: (pi.amount_received || pi.amount || 0) / 100,
        idempotency_key: pi.id
      };

      const orderUrl = new URL('/api/orders', request.url);
      const created = await fetch(orderUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!created.ok) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
      const body = await created.json();
      const orderId = body?.order?.id as string | undefined;
      if (!orderId) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }

      if (orderId && couponCode) {
        recordCouponRedemption({ couponCode, orderId, email: b?.email }).catch(err => console.warn('[coupon redemption] failed', err));
      }

      // Email sending is handled asynchronously by /api/orders (finalizeOrder)

      if (mc && b?.email) {
        const email = String(b.email).trim().toLowerCase();
        const firstName = typeof b.first_name === 'string' ? b.first_name : undefined;
        const lastName = typeof b.last_name === 'string' ? b.last_name : undefined;

        try {
          const subscriber = await prisma.newsletterSubscriber.upsert({
            where: { email },
            create: {
              email,
              firstName,
              lastName,
              source: 'checkout',
              status: 'active',
            },
            update: {
              firstName,
              lastName,
              source: 'checkout',
              status: 'active',
              unsubscribedAt: null,
            },
          });

          const brevoListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
          if (process.env.BREVO_API_KEY) {
            try {
              const brevoId = await upsertBrevoContact({
                email,
                firstName,
                lastName,
                listId: brevoListId,
              });
              if (brevoId && !subscriber.brevoContactId) {
                await prisma.newsletterSubscriber.update({
                  where: { email },
                  data: { brevoContactId: brevoId },
                });
              }
            } catch (error) {
              const maybeAxiosError = error as {
                response?: { status?: number; data?: unknown };
                message?: string;
              };
              console.warn('[stripe-finalize] Failed to sync newsletter to Brevo', {
                message: maybeAxiosError?.message,
                status: maybeAxiosError?.response?.status,
                data: maybeAxiosError?.response?.data
              });
            }
          }
        } catch (error) {
          console.warn('[stripe-finalize] Newsletter upsert failed', error);
        }
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
