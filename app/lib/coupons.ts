import prisma from './prisma';

type ValidateCouponInput = {
  code: string;
  subtotal: number;
  email?: string | null;
};

export type CouponValidationResult = {
  valid: boolean;
  code: string;
  type?: 'percent' | 'fixed';
  amount?: number;
  discountAmount?: number;
  freeShipping?: boolean;
  message?: string;
  couponId?: string;
};

const clampMoney = (value: number) => Math.max(0, Math.round(value * 100) / 100);

export async function validateCoupon({ code, subtotal, email }: ValidateCouponInput): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, code: normalizedCode, message: 'Chýba kód kupónu' };
  }
  const now = new Date();
  const couponDelegate = (prisma as unknown as { coupon?: { findUnique: (args: unknown) => Promise<unknown> } }).coupon;
  const coupon = couponDelegate
    ? await couponDelegate.findUnique({
        where: { code: normalizedCode },
        include: { redemptions: email ? { where: { email: email.toLowerCase() } } : false }
      })
    : await (async () => {
        const rows = await prisma.$queryRawUnsafe<
          Array<{
            id: string;
            code: string;
            description: string | null;
            type: 'percent' | 'fixed';
            amount: number | null;
            percent: number | null;
            freeShipping: boolean;
            active: boolean;
            startsAt: Date | null;
            endsAt: Date | null;
            minOrderTotal: number | null;
            maxUses: number | null;
            usedCount: number;
            maxUsesPerEmail: number | null;
          }>
        >('SELECT * FROM "Coupon" WHERE code = $1 LIMIT 1', normalizedCode);
        const row = rows[0];
        if (!row) return null;
        const redemptionCount = email
          ? await prisma.$queryRawUnsafe<Array<{ count: string }>>(
              'SELECT COUNT(*)::int AS count FROM "CouponRedemption" WHERE "couponId" = $1 AND lower(email) = $2',
              row.id,
              email.toLowerCase()
            )
          : [{ count: '0' }];
        return { ...row, redemptions: Array.from({ length: Number(redemptionCount[0]?.count || 0) }) } as unknown as {
          id: string;
          description: string | null;
          type: 'percent' | 'fixed';
          amount: number | null;
          percent: number | null;
          freeShipping: boolean;
          active: boolean;
          startsAt: Date | null;
          endsAt: Date | null;
          minOrderTotal: number | null;
          maxUses: number | null;
          usedCount: number;
          maxUsesPerEmail: number | null;
          redemptions?: unknown[];
        };
      })();

  if (!coupon || !coupon.active) {
    return { valid: false, code: normalizedCode, message: 'Neplatný alebo neaktívny kupón' };
  }
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, code: normalizedCode, message: 'Kupón ešte nie je aktívny' };
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return { valid: false, code: normalizedCode, message: 'Kupón vypršal' };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, code: normalizedCode, message: 'Kupón už bol vyčerpaný' };
  }
  if (coupon.minOrderTotal && subtotal < Number(coupon.minOrderTotal)) {
    return { valid: false, code: normalizedCode, message: `Minimálna hodnota objednávky je ${Number(coupon.minOrderTotal).toFixed(2)} €` };
  }
  if (coupon.maxUsesPerEmail && email) {
    const redemptions = Array.isArray(coupon.redemptions) ? coupon.redemptions.length : 0;
    if (redemptions >= coupon.maxUsesPerEmail) {
      return { valid: false, code: normalizedCode, message: 'Kupón ste už využili maximálny počet krát' };
    }
  }

  let discountAmount = 0;
  if (coupon.type === 'percent') {
    const percent = coupon.percent || 0;
    discountAmount = clampMoney(subtotal * (percent / 100));
  } else if (coupon.type === 'fixed') {
    discountAmount = clampMoney(Number(coupon.amount || 0));
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    valid: true,
    code: normalizedCode,
    type: coupon.type,
    amount: coupon.type === 'percent' ? coupon.percent || 0 : Number(coupon.amount || 0),
    discountAmount,
    freeShipping: coupon.freeShipping,
    couponId: coupon.id
  };
}

export async function recordCouponRedemption(params: { couponCode?: string | null; orderId: string; email?: string | null }) {
  const code = params.couponCode?.trim().toUpperCase();
  if (!code) return;
  const email = params.email?.toLowerCase() || 'unknown';
  const couponDelegate = (prisma as unknown as { coupon?: { findUnique: (args: unknown) => Promise<unknown> } }).coupon;
  const coupon = couponDelegate
    ? await couponDelegate.findUnique({ where: { code } })
    : await (async () => {
        const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM "Coupon" WHERE code = $1 LIMIT 1', code);
        return rows[0] || null;
      })();
  if (!coupon || !(coupon as { id?: string }).id) return;
  const couponId = (coupon as { id: string }).id;

  await prisma.$transaction(async tx => {
    if ((tx as unknown as { coupon?: { update: (args: unknown) => Promise<unknown> } }).coupon) {
      await (tx as unknown as { coupon: { update: (args: unknown) => Promise<unknown> } }).coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } }
      });
    } else {
      await tx.$executeRawUnsafe('UPDATE "Coupon" SET "usedCount" = "usedCount" + 1 WHERE id = $1', couponId);
    }

    const existing = await tx.couponRedemption.findFirst({
      where: { couponId, orderId: params.orderId }
    });
    if (!existing) {
      await tx.couponRedemption.create({
        data: {
          couponId,
          orderId: params.orderId,
          email
        }
      });
    }
  });
}
