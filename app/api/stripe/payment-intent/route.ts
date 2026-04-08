import {NextResponse} from 'next/server';
import {z} from 'zod';
import crypto from 'crypto';
import { getStripe } from '@/app/lib/stripe';
import { rateLimit } from '@/app/lib/utils/rateLimit';
import { isSalesSuspended, getSalesSuspensionMessage } from '@/app/lib/utils/sales-suspension';
import { getProductsByIds } from '@/app/lib/products';
import { validateCoupon } from '@/app/lib/coupons';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST_PACKETA_HOME, SHIPPING_COST_PACKETA_PICKUP } from '@/app/lib/checkout/constants';
import { SHIPPING_VAT_RATE } from '@/app/lib/pricing/constants';
import { grossFromNet, taxFromNet } from '@/app/lib/pricing/math';

// NOTE: initialize Stripe inside the handler so build doesn't fail when env vars are missing

const requestSchema = z.object({
    cart: z.object({
        line_items: z.array(z.object({ product_id: z.number(), quantity: z.number().positive() })),
        shipping_method: z.string()
    }),
    discountAmount: z.number().nonnegative().default(0).optional(),
    couponCode: z.string().optional(),
    customer: z.object({
        billing: z.any(),
        shipping: z.any(),
        is_business: z.boolean(),
        customer_note: z.string().optional(),
        marketing_consent: z.boolean().optional(),
        meta_data: z.array(z.object({
            key: z.string(),
            value: z.string()
        })).optional()
    })
});

export async function POST(request: Request) {
    try {
        const stripe = getStripe();
        // Check if sales are suspended
        if (isSalesSuspended()) {
            return NextResponse.json(
                { error: getSalesSuspensionMessage() },
                { status: 503 }
            );
        }

        const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
        await rateLimit(ip, 'payment');
        const body = await request.json();

        const validatedData = requestSchema.parse(body);
        // shipping cost is computed after productsTotal; placeholder removed
        const productsTotal = await (async () => {
            let sum = 0;
            try {
                const ids = validatedData.cart.line_items.map(li => li.product_id);
                const uniqueIds = Array.from(new Set(ids));
                const products = await getProductsByIds(uniqueIds);
                const priceMap = new Map<number, number>();
                for (const p of products) {
                    priceMap.set(p.id, Number(p.price || '0'));
                }
                for (const li of validatedData.cart.line_items) {
                    sum += (priceMap.get(li.product_id) || 0) * li.quantity;
                }
            } catch {}
            return sum;
        })();
        const billingEmail = validatedData.customer?.billing?.email as string | undefined;
        const couponCode = validatedData.couponCode?.trim();
        const requestedDiscount = Math.max(0, Number(validatedData.discountAmount || 0));
        const bundleKey = validatedData.customer.meta_data?.find((m) => m.key === '_bundle')?.value;

        let discountAmount = 0;
        let freeShipping = false;
        let couponType: string | undefined;
        let couponRawAmount: number | undefined;

        if (couponCode) {
            const coupon = await validateCoupon({
                code: couponCode,
                subtotal: productsTotal,
                email: billingEmail
            });
            if (!coupon.valid || !coupon.discountAmount) {
                return NextResponse.json({ error: coupon.message || 'Neplatný kupón' }, { status: 400 });
            }
            discountAmount = coupon.discountAmount;
            freeShipping = Boolean(coupon.freeShipping);
            couponType = coupon.type;
            couponRawAmount = coupon.amount;
        } else if (requestedDiscount > 0 && bundleKey) {
            // Manual bundle discount (e.g. cure_1m/2m/3m) comes from curated storefront bundles.
            // Keep it bounded so client input can never exceed subtotal.
            discountAmount = Math.min(requestedDiscount, productsTotal);
            couponType = 'manual';
            couponRawAmount = discountAmount;
        }

        // Recalculate shipping based on actual productsTotal minus discount
        let computedShippingCostBase = 0; // základ bez DPH
        const subtotalAfterDiscount = Math.max(0, productsTotal - discountAmount);
        if (!freeShipping) {
            if (subtotalAfterDiscount < FREE_SHIPPING_THRESHOLD) {
                if (validatedData.cart.shipping_method === 'packeta_home') {
                    computedShippingCostBase = SHIPPING_COST_PACKETA_HOME;
                } else if (validatedData.cart.shipping_method === 'packeta_pickup') {
                    computedShippingCostBase = SHIPPING_COST_PACKETA_PICKUP;
                } else {
                    computedShippingCostBase = 0; // Unknown or free shipping methods
                }
            } else {
                computedShippingCostBase = 0; // Free shipping applies
            }
        }
        
        const computedShippingCost = grossFromNet(computedShippingCostBase, SHIPPING_VAT_RATE); // s DPH

        const total = Math.max(0, productsTotal + computedShippingCost - discountAmount);
        if (!Number.isFinite(total) || total <= 0) {
            return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 });
        }
        const amountInCents = Math.round(total * 100);

        const cartSignature = Buffer.from(JSON.stringify({ li: validatedData.cart.line_items, sm: validatedData.cart.shipping_method, d: discountAmount, cp: couponCode || null, fs: freeShipping })).toString('base64');
        const receiptEmail = validatedData.customer.billing?.email as string | undefined;
        const timestamp = Math.floor(Date.now() / 1000); // Use seconds to allow some deduplication within same second
        const idempotencyKey = crypto.createHash('sha256').update(`${cartSignature}|${receiptEmail || ''}|${amountInCents}|${timestamp}`).digest('hex');

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'eur',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    cart_signature: cartSignature,
                    b: Buffer.from(JSON.stringify(validatedData.customer.billing || {})).toString('base64'),
                    s: Buffer.from(JSON.stringify(validatedData.customer.shipping || {})).toString('base64'),
                    ib: String(Boolean(validatedData.customer.is_business)),
                    mc: String(Boolean(validatedData.customer.marketing_consent)),
                    cn: (validatedData.customer.customer_note || '').slice(0, 480),
                    md: validatedData.customer.meta_data ? Buffer.from(JSON.stringify(validatedData.customer.meta_data)).toString('base64') : '',
                    sc: computedShippingCost.toFixed(2), // shipping cost in EUR as string (gross)
                    sct: computedShippingCostBase.toFixed(2), // net shipping total (base)
                    sctx: taxFromNet(computedShippingCostBase, SHIPPING_VAT_RATE).toFixed(2), // shipping tax
                    cp: couponCode || '',
                    da: discountAmount.toFixed(2),
                    fs: freeShipping ? '1' : '',
                    cpt: couponType || '',
                    cpa: couponRawAmount !== undefined ? String(couponRawAmount) : ''
                },
                statement_descriptor_suffix: 'NKV SHOP',
                receipt_email: receiptEmail
            }, { idempotencyKey });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });
        } catch (stripeError: unknown) {
            // If idempotency key conflict, try to find existing payment intent
            if (stripeError && typeof stripeError === 'object' && 'code' in stripeError && stripeError.code === 'idempotency_key_in_use') {
                // Search for recent payment intents with same cart signature
                try {
                    const paymentIntents = await stripe.paymentIntents.list({
                        limit: 10,
                        created: { gte: Math.floor(Date.now() / 1000) - 3600 } // Last hour
                    });
                    
                    const existingPI = paymentIntents.data.find(pi => 
                        pi.metadata.cart_signature === cartSignature &&
                        pi.amount === amountInCents &&
                        pi.receipt_email === receiptEmail
                    );
                    
                    if (existingPI) {
                        return NextResponse.json({
                            clientSecret: existingPI.client_secret,
                            paymentIntentId: existingPI.id
                        });
                    }
                } catch {
                    // Silent error handling
                }
            }
            
            throw stripeError; // Re-throw the original error
        }
    } catch (error: unknown) {

        if (error instanceof z.ZodError) {
            return NextResponse.json({error: 'Invalid request data', details: error.issues}, {status: 400});
        }

        const maybeStripeError = error as { type?: string; message?: string; statusCode?: number } | undefined;
        if (maybeStripeError && typeof maybeStripeError === 'object' && ('type' in maybeStripeError || 'statusCode' in maybeStripeError)) {
            const stripeType = maybeStripeError.type;
            const stripeMessage = maybeStripeError.message;
            const status = stripeType === 'StripeAuthenticationError' ? 401 : (maybeStripeError.statusCode || 400);
            return NextResponse.json(
                {error: stripeMessage || 'Stripe error'},
                {status}
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            {error: errorMessage},
            {status: 500}
        );
    }
}
