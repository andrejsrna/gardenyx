import crypto from 'crypto';
import prisma from '../prisma';
import { sendReviewRequestEmail } from '../email/review-request';

const DAYS_AFTER_ORDER = 90;

type JobResult = {
  status: 'ok';
  targeted: number;
  sent: number;
  failures?: Array<{ email: string; error: string }>;
};

const generateCouponCode = () => {
  const chunk = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NKV-${chunk}`;
};

const buildReviewUrl = () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://najsilnejsiaklbovavyziva.sk';
  return `${base.replace(/\/$/, '')}/recenzie`;
};

export async function runReviewRequestJob(limit: number = 200): Promise<JobResult> {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - DAYS_AFTER_ORDER);

  const orders = await prisma.order.findMany({
    where: {
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: { lte: cutoff },
      meta: {
        none: { key: 'review_request_sent_at' }
      },
      addresses: {
        some: { type: 'BILLING', email: { not: null } }
      }
    },
    include: {
      items: true,
      addresses: true,
      meta: true
    },
    orderBy: { createdAt: 'asc' },
    take: Math.max(1, Math.min(500, limit))
  });

  let sent = 0;
  const failures: Array<{ email: string; error: string }> = [];
  const reviewUrl = buildReviewUrl();

  for (const order of orders) {
    const billing = order.addresses.find(a => a.type === 'BILLING');
    const to = billing?.email;
    if (!to) continue;

    const existingRequest = await prisma.reviewRequest.findFirst({
      where: { orderId: order.id }
    });
    if (existingRequest) {
      // Already sent or pending token, skip sending again
      continue;
    }

    const firstName = billing?.firstName;
    const token = generateCouponCode();

    try {
      await prisma.reviewRequest.create({
        data: {
          email: to.toLowerCase(),
          orderId: order.id,
          firstName: firstName || null,
          lastName: billing?.lastName || null,
          token
        }
      });

      await sendReviewRequestEmail({
        to,
        firstName,
        token,
        reviewUrl: `${reviewUrl}?token=${token}`
      });

      await prisma.orderMeta.createMany({
        data: [
          { orderId: order.id, key: 'review_request_sent_at', value: new Date().toISOString() }
        ],
        skipDuplicates: true
      });

      sent += 1;
    } catch (error) {
      failures.push({ email: to, error: error instanceof Error ? error.message : 'unknown' });
    }
  }

  return {
    status: 'ok',
    targeted: orders.length,
    sent,
    failures
  };
}
