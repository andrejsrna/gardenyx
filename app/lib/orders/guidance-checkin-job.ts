import { isMarketingAutomationEnabled } from '../automation/config';
import prisma from '../prisma';
import { sendGuidanceEmail } from '../email/guidance-checkin';

const DAYS_AFTER_ORDER = 7;
const WINDOW_MINUTES = 10;

export type GuidanceCheckinJobResult = {
  status: 'ok';
  targeted: number;
  sent: number;
  failures?: Array<{ email: string; error: string }>;
};

export async function runGuidanceCheckinJob(limit: number = 200): Promise<GuidanceCheckinJobResult> {
  if (!isMarketingAutomationEnabled()) {
    return {
      status: 'ok',
      targeted: 0,
      sent: 0,
      failures: [],
    };
  }

  const now = new Date();
  const cutoffStart = new Date(now);
  cutoffStart.setDate(cutoffStart.getDate() - DAYS_AFTER_ORDER);
  const cutoffEnd = new Date(cutoffStart);
  cutoffEnd.setMinutes(cutoffEnd.getMinutes() + WINDOW_MINUTES);

  const orders = await prisma.order.findMany({
    where: {
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: {
        gte: cutoffStart,
        lt: cutoffEnd
      },
      meta: {
        none: { key: 'guidance_email_sent_at' }
      },
      addresses: {
        some: { type: 'BILLING', email: { not: null } }
      }
    },
    include: {
      addresses: true
    },
    orderBy: { createdAt: 'asc' },
    take: Math.max(1, Math.min(500, limit))
  });

  let sent = 0;
  const failures: Array<{ email: string; error: string }> = [];

  for (const order of orders) {
    const billing = order.addresses.find(a => a.type === 'BILLING');
    const to = billing?.email?.trim();
    if (!to) continue;

    try {
      await sendGuidanceEmail({ to, firstName: billing?.firstName });
      await prisma.orderMeta.createMany({
        data: [
          {
            orderId: order.id,
            key: 'guidance_email_sent_at',
            value: new Date().toISOString()
          }
        ],
        skipDuplicates: true
      });
      sent += 1;
    } catch (error) {
      failures.push({
        email: to,
        error: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  return {
    status: 'ok',
    targeted: orders.length,
    sent,
    failures
  };
}
