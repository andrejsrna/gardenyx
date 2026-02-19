import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { finalizeOrder } from '@/app/lib/checkout/finalize-order';

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('limit')) || 50));
  const olderThanMin = Math.max(0, Number(url.searchParams.get('olderThanMin')) || 2);

  const olderThan = new Date(Date.now() - olderThanMin * 60 * 1000);

  // Find recent processing orders that still miss email and/or packeta.
  // We only retry if the last error (or creation time) is older than olderThan.
  const candidates = await prisma.order.findMany({
    where: {
      status: 'processing',
      OR: [
        // email missing
        { meta: { none: { key: '_email_sent_at' } } },
        // packeta needed but missing
        {
          AND: [
            { shippingMethod: { in: ['packeta_home', 'packeta_pickup'] } },
            { meta: { none: { key: '_packeta_packet_id' } } }
          ]
        }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { meta: true }
  });

  const results: Array<{ orderId: string; result: unknown }> = [];
  let attempted = 0;

  for (const order of candidates) {
    const meta = new Map(order.meta.map(m => [m.key, m.value || '']));
    const emailErrorAt = meta.get('_email_error_at') || null;
    const packetaErrorAt = meta.get('_packeta_error_at') || null;

    const times = [emailErrorAt, packetaErrorAt, order.createdAt.toISOString()].filter((v): v is string => Boolean(v));
    const lastIso = times.sort().slice(-1)[0] || order.createdAt.toISOString();
    const lastRelevantAt = new Date(lastIso);

    if (lastRelevantAt > olderThan) {
      continue;
    }

    attempted += 1;
    try {
      // Cron retries should NOT send customer emails to avoid spam.
      const res = await finalizeOrder(order.id, { allowCustomerEmail: false });
      results.push({ orderId: order.id, result: res });
    } catch (err) {
      results.push({ orderId: order.id, result: { ok: false, error: err instanceof Error ? err.message : String(err) } });
    }
  }

  return NextResponse.json({ ok: true, candidates: candidates.length, attempted, results });
}
