import { NextResponse } from 'next/server';
import { Prisma, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { getStripe } from '@/app/lib/stripe';
import prisma from '@/app/lib/prisma';
import { getProductsByIds } from '@/app/lib/products';
import { recordCouponRedemption } from '@/app/lib/coupons';
import { finalizeOrder } from '@/app/lib/checkout/finalize-order';
import { PRODUCT_VAT_RATE, SHIPPING_VAT_RATE } from '@/app/lib/pricing/constants';
import { taxFromGross } from '@/app/lib/pricing/math';

// NOTE: initialize Stripe inside the handler so build doesn't fail when env vars are missing

export type StripePI = {
  id: string;
  amount?: number;
  amount_received?: number;
  status?: string;
  metadata?: Record<string, string | undefined>;
};

const toDec = (value: number | string | undefined, fallback = 0) => {
  const num = typeof value === 'string' ? Number(value) : value;
  const safe = Number.isFinite(num) ? Number(num) : fallback;
  return new Prisma.Decimal(safe.toFixed(2));
};

const parseBase64Json = <T>(value?: string): T | undefined => {
  if (!value) return undefined;
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as T;
  } catch {
    return undefined;
  }
};

export async function ensureOrderFromPaymentIntent(pi: StripePI) {
  const existing = await prisma.order.findFirst({
    where: {
      OR: [
        { transactionId: pi.id },
        { meta: { some: { key: '_stripe_payment_intent_id', value: pi.id } } }
      ]
    },
    include: { meta: true }
  });

  if (existing) {
    await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: OrderStatus.processing,
        paymentStatus: PaymentStatus.paid,
        transactionId: pi.id,
      }
    });
    return existing.id;
  }

  const md = (pi.metadata || {}) as Record<string, string | undefined>;
  const cart = parseBase64Json<{ li: Array<{ product_id: number; quantity: number }>; sm: string }>(md.cart_signature);
  const billing = parseBase64Json<Record<string, unknown>>(md.b) || {};
  const shipping = parseBase64Json<Record<string, unknown>>(md.s) || {};
  const metaData = parseBase64Json<Array<{ key: string; value: string }>>(md.md) || [];

  if (!cart?.li?.length) {
    return null;
  }

  const productIds = cart.li.map(i => i.product_id);
  const products = await getProductsByIds(productIds);
  const priceMap = new Map<number, { price: number; name: string; sku?: string | null }>();
  for (const p of products) {
    priceMap.set(p.id, { price: Number(p.price || 0), name: p.name, sku: p.sku || null });
  }

  const lineItems = cart.li.map(i => {
    const data = priceMap.get(i.product_id);
    const price = data ? data.price : 0;
    return {
      productId: BigInt(i.product_id),
      productName: data?.name || `Product ${i.product_id}`,
      sku: data?.sku || undefined,
      price: toDec(price),
      quantity: i.quantity,
      total: toDec(price * i.quantity),
    };
  });

  const subtotalNum = lineItems.reduce((sum, li) => sum + Number(li.total), 0);
  const shippingGross = Number(md.sc || 0);
  const shippingTax = Number(md.sctx ?? taxFromGross(shippingGross, SHIPPING_VAT_RATE).toFixed(2));
  const discountTotal = Number(md.da || 0);
  const totalFromStripe = ((pi.amount_received || pi.amount || 0) / 100);

  const billingEmail = typeof billing.email === 'string' ? billing.email.toLowerCase() : undefined;
  const packeta = {
    id: metaData.find(m => m.key === '_packeta_point_id')?.value || null,
    name: metaData.find(m => m.key === '_packeta_point_name')?.value || null,
    city: metaData.find(m => m.key === '_packeta_point_city')?.value || null,
    street: metaData.find(m => m.key === '_packeta_point_street')?.value || null,
    zip: metaData.find(m => m.key === '_packeta_point_zip')?.value || null,
  };

  const rawMetaList = [
    { key: '_stripe_payment_intent_id', value: pi.id },
    ...(md.cp ? [{ key: '_coupon_code', value: md.cp }] : []),
    ...(discountTotal > 0 ? [{ key: '_discount_total', value: discountTotal.toFixed(2) }] : []),
    ...(md.cpt ? [{ key: '_coupon_type', value: md.cpt }] : []),
    ...(md.cpa ? [{ key: '_coupon_value', value: md.cpa }] : []),
    ...(md.fs === '1' ? [{ key: '_coupon_free_shipping', value: 'true' }] : []),
    ...metaData,
  ];

  const metaMap = new Map<string, string>();
  for (const m of rawMetaList) {
    if (m.key && typeof m.value !== 'undefined') {
      metaMap.set(m.key, String(m.value));
    }
  }
  const uniqueMetaData = Array.from(metaMap.entries()).map(([key, value]) => ({ key, value }));

  const created = await prisma.order.create({
    data: {
      status: OrderStatus.processing,
      paymentStatus: PaymentStatus.paid,
      paymentMethod: PaymentMethod.stripe,
      transactionId: pi.id,
      currency: 'EUR',
      subtotal: toDec(subtotalNum),
      shippingTotal: toDec(shippingGross),
      taxTotal: toDec(taxFromGross(subtotalNum, PRODUCT_VAT_RATE) + shippingTax),
      discountTotal: toDec(discountTotal),
      total: toDec(totalFromStripe),
      shippingMethod: cart.sm,
      customerNote: md.cn || undefined,
      marketingConsent: md.mc === 'true',
      packetaPointId: packeta.id,
      packetaPointName: packeta.name,
      packetaPointCity: packeta.city,
      packetaPointStreet: packeta.street,
      packetaPointZip: packeta.zip,
      meta: {
        create: uniqueMetaData
      },
      items: { create: lineItems },
      addresses: {
        create: [
          {
            type: 'BILLING',
            firstName: String(billing.first_name || ''),
            lastName: String(billing.last_name || ''),
            company: typeof billing.company === 'string' ? billing.company : undefined,
            address1: String(billing.address_1 || ''),
            address2: typeof billing.address_2 === 'string' ? billing.address_2 : undefined,
            city: String(billing.city || ''),
            state: typeof billing.state === 'string' ? billing.state : undefined,
            postcode: String(billing.postcode || ''),
            country: String(billing.country || 'SK'),
            phone: typeof billing.phone === 'string' ? billing.phone : undefined,
            email: billingEmail,
            ic: typeof billing.ic === 'string' ? billing.ic : undefined,
            dic: typeof billing.dic === 'string' ? billing.dic : undefined,
            dicDph: typeof billing.dic_dph === 'string' ? billing.dic_dph : undefined,
          },
          {
            type: 'SHIPPING',
            firstName: String(shipping.first_name || billing.first_name || ''),
            lastName: String(shipping.last_name || billing.last_name || ''),
            company: typeof shipping.company === 'string' ? shipping.company : undefined,
            address1: String(shipping.address_1 || billing.address_1 || ''),
            address2: typeof shipping.address_2 === 'string' ? shipping.address_2 : undefined,
            city: String(shipping.city || billing.city || ''),
            state: typeof shipping.state === 'string' ? shipping.state : undefined,
            postcode: String(shipping.postcode || billing.postcode || ''),
            country: String(shipping.country || billing.country || 'SK'),
            phone: typeof billing.phone === 'string' ? billing.phone : undefined,
            email: billingEmail,
          }
        ]
      }
    }
  });

  if (md.cp) {
    recordCouponRedemption({ couponCode: md.cp, orderId: created.id, email: billingEmail }).catch(() => null);
  }

  finalizeOrder(created.id).catch(() => null);
  return created.id;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  try {
    const signature = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !endpointSecret) {
      return NextResponse.json({ error: 'Invalid webhook config' }, { status: 400 });
    }

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
        const pi = typedEvent.data.object as StripePI;
        try {
          const orderId = pi.metadata?.order_id;
          if (orderId) {
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            if (order) {
              const expectedCents = Number(order.total) * 100;
              if (Number.isFinite(expectedCents) && expectedCents > 0 && typeof pi.amount_received === 'number' && pi.amount_received !== expectedCents) {
                await prisma.order.update({
                  where: { id: orderId },
                  data: {
                    status: OrderStatus.on_hold,
                    meta: { create: { key: '_stripe_amount_received', value: String(pi.amount_received) } }
                  }
                });
                break;
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
              break;
            }
          }

          await ensureOrderFromPaymentIntent(pi);
        } catch (err) {
          console.error('[Stripe Webhook] ensureOrderFromPaymentIntent failed:', err);
          // keep webhook resilient
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
