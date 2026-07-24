import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPacketaShippingQuote } from '@/app/lib/checkout/packeta-shipping';

const schema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    variationId: z.number().int().positive().optional(),
    sku: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingMethod: z.enum(['packeta_pickup', 'packeta_home', 'personal_pickup']),
  paymentMethod: z.enum(['stripe', 'cod', 'bank_transfer', 'other']).optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const quote = await getPacketaShippingQuote(input.items, input.shippingMethod, input.paymentMethod);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to calculate shipping' },
      { status: 400 },
    );
  }
}
