import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {z} from 'zod';

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('CRITICAL: STRIPE_SECRET_KEY is not defined at module load time.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    appInfo: {
        name: 'NKV Shop',
        version: '1.0.0',
        url: process.env.NEXT_PUBLIC_SITE_URL
    },
    telemetry: false
});

const requestSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().default('eur'),
    metadata: z.object({
        order_id: z.string(),
        customer_email: z.string().email().nullish()
    })
});

export async function POST(request: Request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('[PaymentIntent API] STRIPE_SECRET_KEY is missing inside POST handler.');
        return NextResponse.json({error: 'Server configuration error'}, {status: 500});
    }

    try {
        const body = await request.json();

        const validatedData = requestSchema.parse(body);

        const amountInCents = Math.round(validatedData.amount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: validatedData.currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                order_id: validatedData.metadata.order_id,
                ...(validatedData.metadata.customer_email && {
                    customer_email: validatedData.metadata.customer_email
                })
            },
            statement_descriptor_suffix: 'NKV SHOP',
            ...(validatedData.metadata.customer_email && {
                receipt_email: validatedData.metadata.customer_email
            })
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('[PaymentIntent API] Error during processing:', error);

        if (error instanceof z.ZodError) {
            console.error('[PaymentIntent API] Validation Error:', error.errors);
            return NextResponse.json({error: 'Invalid request data', details: error.errors}, {status: 400});
        }

        if (error instanceof Stripe.errors.StripeError) {
            console.error(`[PaymentIntent API] Stripe Error (${error.type}): ${error.message}`);
            const status = error.type === 'StripeAuthenticationError' ? 401 : (error.statusCode || 400);
            return NextResponse.json(
                {error: error.message},
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
