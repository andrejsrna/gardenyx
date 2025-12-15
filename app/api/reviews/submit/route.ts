import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '@/app/lib/prisma';
import { sendReviewThankYouEmail } from '@/app/lib/email/review-thankyou';

const requestSchema = z.object({
  token: z.string().min(6),
  rating: z.number().int().min(1).max(5),
  name: z.string().min(2).max(120),
  content: z.string().min(10).max(2000)
});

const REVIEW_COUPON_PERCENT = 10;
const REVIEW_COUPON_VALID_DAYS = 30;

const generateCouponCode = () => `NKV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const token = parsed.token.trim().toUpperCase();

    const reviewDelegate = (prisma as unknown as { reviewRequest?: { findUnique: (args: unknown) => Promise<unknown> } }).reviewRequest;
    const hasReviewDelegate = typeof reviewDelegate?.findUnique === 'function';
    const record = hasReviewDelegate
      ? await reviewDelegate.findUnique({ where: { token } })
      : await prisma.$queryRawUnsafe<{ id: string; email: string; firstName?: string | null; lastName?: string | null; token: string; usedAt?: Date | null; couponCode?: string | null }[]>('SELECT * FROM "ReviewRequest" WHERE "token" = $1 LIMIT 1', token);
    const requestRecord = Array.isArray(record) ? record[0] : record as { id: string; email: string; firstName?: string | null; lastName?: string | null; token: string; usedAt?: Date | null; couponCode?: string | null } | null;
    if (!requestRecord) {
      return NextResponse.json({ error: 'Token je neplatný alebo expirovaný' }, { status: 400 });
    }
    if (requestRecord.usedAt) {
      return NextResponse.json({ error: 'Recenzia s týmto tokenom už bola odoslaná' }, { status: 400 });
    }

    const now = new Date();
    const couponCode = requestRecord.couponCode || generateCouponCode();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + REVIEW_COUPON_VALID_DAYS);

    const couponDelegate = (prisma as unknown as { coupon?: { upsert: (args: unknown) => Promise<unknown> } }).coupon;
    const performCouponUpsert = async (tx?: typeof prisma) => {
      const client = tx || prisma;
      if (couponDelegate?.upsert) {
        return couponDelegate.upsert({
          where: { code: couponCode },
          update: {
            type: 'percent',
            percent: REVIEW_COUPON_PERCENT,
            freeShipping: false,
            active: true,
            endsAt: expires,
            description: 'Kupón za recenziu',
            maxUsesPerEmail: 1
          },
          create: {
            code: couponCode,
            type: 'percent',
            percent: REVIEW_COUPON_PERCENT,
            freeShipping: false,
            active: true,
            endsAt: expires,
            description: 'Kupón za recenziu',
            maxUsesPerEmail: 1,
            minOrderTotal: null
          }
        });
      }
      return client.$executeRawUnsafe(
        'INSERT INTO "Coupon" (id, code, type, percent, "freeShipping", active, "endsAt", description, "maxUsesPerEmail", "createdAt", "updatedAt")\n        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())\n        ON CONFLICT (code) DO UPDATE SET type=$2, percent=$3, "freeShipping"=$4, active=$5, "endsAt"=$6, description=$7, "maxUsesPerEmail"=$8, \"updatedAt\"=NOW()',
        couponCode,
        'percent',
        REVIEW_COUPON_PERCENT,
        false,
        true,
        expires,
        'Kupón za recenziu',
        1
      );
    };

    await prisma.$transaction(async tx => {
      await performCouponUpsert(tx);

      if (hasReviewDelegate && (tx as unknown as { reviewRequest?: { update: (args: unknown) => Promise<unknown> } }).reviewRequest) {
        await (tx as unknown as { reviewRequest: { update: (args: unknown) => Promise<unknown> } }).reviewRequest.update({
          where: { id: requestRecord.id },
          data: {
            usedAt: now,
            rating: parsed.rating,
            content: parsed.content,
            name: parsed.name,
            couponCode
          }
        });
      } else {
        await tx.$executeRawUnsafe(
          'UPDATE "ReviewRequest" SET "usedAt"=$1, "rating"=$2, "content"=$3, "name"=$4, "couponCode"=$5 WHERE id=$6',
          now,
          parsed.rating,
          parsed.content,
          parsed.name,
          couponCode,
          requestRecord.id
        );
      }
    });

    if (requestRecord.email) {
      sendReviewThankYouEmail({
        to: requestRecord.email,
        firstName: requestRecord.firstName,
        couponCode
      }).catch(err => console.warn('[review thankyou email] failed', err));
    }

    return NextResponse.json({
      success: true,
      couponCode
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatné dáta', details: error.issues }, { status: 400 });
    }
    console.error('[review submit] failed', error);
    return NextResponse.json({ error: 'Serverová chyba' }, { status: 500 });
  }
}
