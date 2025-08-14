import {NextResponse} from 'next/server';
import {z} from 'zod';
import { getStripe } from '@/app/lib/stripe';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { rateLimit } from '@/app/lib/utils/rateLimit';

const stripe = getStripe();

const requestSchema = z.object({
    orderId: z.string().regex(/^\d+$/, 'orderId must be numeric'),
    metadata: z.object({
        customer_email: z.string().email().nullish()
    }).optional()
});

const wc = new WooCommerceRestApi({
    url: process.env.WORDPRESS_URL!,
    consumerKey: process.env.WC_CONSUMER_KEY!,
    consumerSecret: process.env.WC_CONSUMER_SECRET!,
    version: 'wc/v3'
});

export async function POST(request: Request) {
    try {
        const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
        await rateLimit(ip, 'payment');
        const body = await request.json();

        const validatedData = requestSchema.parse(body);
        const orderId = validatedData.orderId;

        const orderResponse = await wc.get(`orders/${orderId}`);
        const order = orderResponse.data as { total?: string; status?: string };
        const total = Number(order.total || '0');
        if (!Number.isFinite(total) || total <= 0) {
            return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
        }
        if (order.status && !['pending', 'on-hold', 'processing'].includes(order.status)) {
            return NextResponse.json({ error: 'Order not eligible for payment' }, { status: 400 });
        }
        const amountInCents = Math.round(total * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                order_id: orderId,
                ...(validatedData.metadata?.customer_email && {
                    customer_email: validatedData.metadata.customer_email
                })
            },
            statement_descriptor_suffix: 'NKV SHOP',
            ...(validatedData.metadata?.customer_email && {
                receipt_email: validatedData.metadata.customer_email
            })
        }, {
            idempotencyKey: `payment_intent_${orderId}`
        });

        try {
            await wc.put(`orders/${orderId}`, {
                meta_data: [
                    { key: '_stripe_payment_intent_id', value: paymentIntent.id }
                ]
            });
        } catch {}

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('[PaymentIntent API] Error during processing:', error);

        if (error instanceof z.ZodError) {
            console.error('[PaymentIntent API] Validation Error:', error.issues);
            return NextResponse.json({error: 'Invalid request data', details: error.issues}, {status: 400});
        }

        if (error && typeof error === 'object' && 'type' in (error as any) && 'statusCode' in (error as any)) {
            const stripeType = (error as any)?.type as string | undefined;
            const stripeMessage = (error as any)?.message as string | undefined;
            const status = stripeType === 'StripeAuthenticationError' ? 401 : ((error as any)?.statusCode || 400);
            return NextResponse.json(
                {error: stripeMessage || 'Stripe error'},
                {status}
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[PaymentIntent API] Generic Error: ${errorMessage}`);
        return NextResponse.json(
            {error: errorMessage},
            {status: 500}
        );
    }
}
