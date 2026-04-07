import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';
import { isAutomationAuthorized } from '../../../../lib/automation/config';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(500).default(100),
});

export async function GET(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
  const limit = parsed.success ? parsed.data.limit : 100;

  const [subscribers, total, unsubscribed] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: 'unsubscribed' } }),
  ]);

  return NextResponse.json({
    total,
    unsubscribed,
    active: total - unsubscribed,
    subscribers,
  });
}
