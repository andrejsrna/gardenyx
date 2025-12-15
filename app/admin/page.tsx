import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

function formatCurrency(value: number) {
  return value.toLocaleString('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
}

function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function fetchOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { items: true, addresses: true }
  });
}

export default async function AdminPage() {
  const orders = await fetchOrders();
  const recentOrders = orders.slice(0, 10);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30d = orders.filter((order) => new Date(order.createdAt) >= thirtyDaysAgo);

  const revenue30d = last30d.reduce((sum, order) => {
    const total = Number(order.total || 0);
    return sum + total;
  }, 0);

  const metrics = [
    { label: 'Tržby (30d)', value: last30d.length ? formatCurrency(revenue30d) : '—', change: '' },
    { label: 'Objednávky (30d)', value: last30d.length.toString(), change: '' },
    {
      label: 'Priem. hodnota',
      value: last30d.length ? formatCurrency(revenue30d / last30d.length) : '—',
      change: ''
    },
    { label: 'Posledná objednávka', value: recentOrders[0]?.id ? `#${recentOrders[0].id}` : '—', change: '' }
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Prehľad objednávok</h1>
        <p className="mt-2 text-sm text-slate-300">Údaje z internej databázy.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
            <p className="text-sm text-slate-300">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Posledné objednávky</h2>
          <span className="text-sm text-slate-300">Spolu: {orders.length}</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Zákazník</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Stav</th>
                <th className="px-4 py-3 text-left font-medium">Platba</th>
                <th className="px-4 py-3 text-left font-medium">Suma</th>
                <th className="px-4 py-3 text-left font-medium">Dátum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {recentOrders.map((order) => {
                const billing = order.addresses.find((a) => a.type === 'BILLING');
                return (
                  <tr key={order.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-white">#{order.id}</td>
                    <td className="px-4 py-3 text-slate-200">
                      {[billing?.firstName, billing?.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{billing?.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{order.paymentMethod}</td>
                    <td className="px-4 py-3 text-slate-100">{order.total.toString()} EUR</td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(order.createdAt)}</td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-300">
                    Nepodarilo sa načítať objednávky.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
