import Link from 'next/link';
import prisma from '@/app/lib/prisma';
import { statusClass, statusLabels } from '@/app/admin/orders/constants';

export const dynamic = 'force-dynamic';

type SearchParams = {
  days?: string;
};

const DAY_PRESETS = [7, 30, 90] as const;

function clampDays(value: unknown) {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(365, Math.max(1, parsed));
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatCurrency(value: number, currency = 'EUR') {
  return value.toLocaleString('sk-SK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompactNumber(value: number) {
  return value.toLocaleString('sk-SK');
}

function bucketPaidRevenueByDay(
  rows: Array<{ createdAt: Date; total: unknown }>,
  rangeStart: Date,
  rangeEnd: Date,
) {
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = startOfDay(row.createdAt).toISOString().slice(0, 10);
    const amount = Number(row.total || 0);
    buckets.set(key, (buckets.get(key) || 0) + (Number.isFinite(amount) ? amount : 0));
  }

  const sorted: Array<{ date: string; value: number }> = [];
  const cursor = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    sorted.push({ date: key, value: buckets.get(key) || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return sorted;
}

function BarChart({ data }: { data: Array<{ date: string; value: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex h-28 items-end gap-1">
      {data.map((d) => {
        const height = Math.round((d.value / max) * 100);
        const title = `${d.date}: ${formatCurrency(d.value)}`;
        return (
          <div
            key={d.date}
            title={title}
            className="flex-1 rounded-md bg-emerald-400/20 hover:bg-emerald-400/30"
            style={{ height: `${height}%` }}
          />
        );
      })}
      {data.length === 0 ? <div className="text-sm text-slate-400">Žiadne dáta</div> : null}
    </div>
  );
}

export default async function AdminStatsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const days = clampDays(resolvedSearchParams?.days);
  const now = new Date();
  const from = startOfDay(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));

  const [paidAgg, allAgg, paidCustomerGroups, statusGroups, paymentMethodGroups, paidRowsForChart, topItems] =
    await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: from }, paymentStatus: 'paid' },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: from } },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.orderAddress.groupBy({
        by: ['email'],
        where: { type: 'BILLING', email: { not: null }, order: { createdAt: { gte: from }, paymentStatus: 'paid' } },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: from } },
        _count: { _all: true },
        orderBy: { _count: { status: 'desc' } },
      }),
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: from } },
        _count: { _all: true },
        orderBy: { _count: { paymentMethod: 'desc' } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: from }, paymentStatus: 'paid' },
        select: { createdAt: true, total: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: { order: { createdAt: { gte: from }, paymentStatus: 'paid' } },
        _sum: { total: true, quantity: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
    ]);

  const paidRevenue = Number(paidAgg._sum.total || 0);
  const paidOrders = paidAgg._count._all;
  const allOrders = allAgg._count._all;
  const allTotal = Number(allAgg._sum.total || 0);
  const aov = paidOrders ? paidRevenue / paidOrders : 0;
  const paidCustomers = paidCustomerGroups.length;

  const chartData = bucketPaidRevenueByDay(paidRowsForChart, from, now);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Štatistiky</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Prehľad nákupov</h1>
            <p className="mt-2 text-sm text-slate-300">Agregované údaje z internej DB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAY_PRESETS.map((preset) => (
              <a
                key={preset}
                href={`/admin/stats?days=${preset}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  preset === days
                    ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100'
                    : 'border-slate-700 bg-white/5 text-white hover:border-emerald-400/60 hover:text-emerald-100'
                }`}
              >
                {preset} dní
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
          <p className="text-sm text-slate-300">Tržby (paid, {days} dní)</p>
          <p className="mt-2 text-2xl font-semibold text-white">{paidOrders ? formatCurrency(paidRevenue) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
          <p className="text-sm text-slate-300">Objednávky (paid, {days} dní)</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(paidOrders)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
          <p className="text-sm text-slate-300">Priem. hodnota (paid)</p>
          <p className="mt-2 text-2xl font-semibold text-white">{paidOrders ? formatCurrency(aov) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
          <p className="text-sm text-slate-300">Unikátni zákazníci (paid, {days} dní)</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(paidCustomers)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Tržby po dňoch</h2>
              <p className="mt-1 text-sm text-slate-300">Len platby označené ako paid, od {from.toLocaleDateString('sk-SK')}.</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Spolu</p>
              <p className="text-sm font-semibold text-slate-100">{paidOrders ? formatCurrency(paidRevenue) : '—'}</p>
            </div>
          </div>
          <div className="mt-4">
            <BarChart data={chartData} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <h2 className="text-lg font-semibold text-white">Rýchly prehľad</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-300">Objednávky (všetky)</dt>
              <dd className="font-semibold text-white">{formatCompactNumber(allOrders)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-300">Suma (všetky)</dt>
              <dd className="font-semibold text-white">{allOrders ? formatCurrency(allTotal) : '—'}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-200">Platobná metóda</h3>
            <div className="mt-3 space-y-2">
              {paymentMethodGroups.map((row) => (
                <div key={row.paymentMethod} className="flex items-center justify-between text-sm">
                  <div className="text-slate-300">{row.paymentMethod}</div>
                  <div className="font-semibold text-slate-100">
                    {formatCompactNumber(typeof row._count === 'object' ? (row._count._all ?? 0) : 0)}
                  </div>
                </div>
              ))}
              {paymentMethodGroups.length === 0 ? <div className="text-sm text-slate-400">Žiadne dáta</div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <h2 className="text-lg font-semibold text-white">Stavy objednávok ({days} dní)</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Stav</th>
                  <th className="px-4 py-3 text-right font-medium">Počet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {statusGroups.map((row) => (
                  <tr key={row.status} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(row.status)}`}>
                        {statusLabels[row.status] || row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-100">
                      {formatCompactNumber(typeof row._count === 'object' ? (row._count._all ?? 0) : 0)}
                    </td>
                  </tr>
                ))}
                {statusGroups.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-slate-300">
                      Žiadne dáta.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <h2 className="text-lg font-semibold text-white">Top produkty (paid, {days} dní)</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Produkt</th>
                  <th className="px-4 py-3 text-right font-medium">Ks</th>
                  <th className="px-4 py-3 text-right font-medium">Tržby</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {topItems.map((row) => (
                  <tr key={`${row.productId}-${row.productName}`} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 text-slate-200">{row.productName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-100">
                      {formatCompactNumber(row._sum.quantity || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-100">
                      {formatCurrency(Number(row._sum.total || 0))}
                    </td>
                  </tr>
                ))}
                {topItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-300">
                      Žiadne dáta.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
        <div>Tip: ak chceš filtre (stav, mena, zdroj kampane), doplníme cez query parametre.</div>
        <Link
          href="/admin"
          className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100"
        >
          Späť na dashboard
        </Link>
      </div>
    </div>
  );
}
