import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCartWeightKg, PACKETA_MAX_WEIGHT_KG } from '@/app/lib/checkout/packeta-shipping';

const schema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    variationId: z.number().int().positive().optional(),
    sku: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const weightKg = await getCartWeightKg(input.items);
    return NextResponse.json({
      weightKg,
      maxKg: PACKETA_MAX_WEIGHT_KG,
      isOverweight: weightKg > PACKETA_MAX_WEIGHT_KG,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to calculate weight' },
      { status: 400 },
    );
  }
}
