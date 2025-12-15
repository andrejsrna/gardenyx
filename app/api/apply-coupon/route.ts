import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCoupon } from '@/app/lib/coupons';

const requestSchema = z.object({
  code: z.string(),
  subtotal: z.number().nonnegative(),
  email: z.string().email().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const result = await validateCoupon({
      code: parsed.code,
      subtotal: parsed.subtotal,
      email: parsed.email
    });

    if (!result.valid) {
      return NextResponse.json({ error: result.message || 'Neplatný kupón' }, { status: 400 });
    }

    return NextResponse.json({
      code: result.code,
      type: result.type,
      amount: result.amount,
      discount_amount: result.discountAmount,
      free_shipping: result.freeShipping
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatné dáta', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Serverová chyba' }, { status: 500 });
  }
}
