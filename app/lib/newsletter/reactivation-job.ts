import prisma from '../prisma';
import { isReactivationFlowEnabled } from '../feature-flags';
import { sendReactivationEmail } from './reactivation';

const DAYS_MIN = 30;
const DAYS_MAX = 60;

export type ReactivationJobResult = {
  status: 'ok' | 'disabled';
  targeted?: number;
  sent?: number;
  failures?: Array<{ email: string; error: string }>;
};

export async function runReactivationJob(limit: number = 200): Promise<ReactivationJobResult> {
  const enabled = await isReactivationFlowEnabled();
  if (!enabled) {
    return { status: 'disabled' };
  }

  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() - DAYS_MAX);
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() - DAYS_MIN);

  const candidates = await prisma.newsletterSubscriber.findMany({
    where: {
      status: 'active',
      reactivationSentAt: null,
      createdAt: {
        gte: minDate,
        lte: maxDate,
      },
    },
    take: Math.max(1, Math.min(500, limit)),
  });

  let sent = 0;
  const failures: Array<{ email: string; error: string }> = [];

  for (const subscriber of candidates) {
    try {
      await sendReactivationEmail(subscriber.email, subscriber.firstName, subscriber.lastName);
      await prisma.newsletterSubscriber.update({
        where: { email: subscriber.email },
        data: { reactivationSentAt: new Date() },
      });
      sent += 1;
    } catch (error) {
      failures.push({ email: subscriber.email, error: error instanceof Error ? error.message : 'unknown' });
    }
  }

  return {
    status: 'ok',
    targeted: candidates.length,
    sent,
    failures,
  };
}
