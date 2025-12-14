import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export const dynamic = 'force-dynamic';

type WooOrder = {
  id: number;
  total: string;
  status: string;
  date_created: string;
  payment_method_title?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
  };
  shipping_lines?: Array<{ method_title?: string }>;
  total_refunded?: string;
};

const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3'
});

async function fetchOrders(): Promise<WooOrder[]> {
  if (!process.env.WORDPRESS_URL || !process.env.WC_CONSUMER_KEY || !process.env.WC_CONSUMER_SECRET) {
    console.warn('[admin-dashboard] Missing WooCommerce credentials');
    return [];
  }

  try {
    const response = await api.get('orders', {
      per_page: 25,
      orderby: 'date',
      order: 'desc'
    });
    return Array.isArray(response.data) ? (response.data as WooOrder[]) : [];
  } catch (error) {
    console.error('[admin-dashboard] Failed to fetch orders', error);
    return [];
  }
}

function formatCurrency(value: number) {
  return value.toLocaleString('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function AdminPage() {
  const orders = await fetchOrders();
  const recentOrders = orders.slice(0, 10);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30d = orders.filter((order) => new Date(order.date_created) >= thirtyDaysAgo);

  const revenue30d = last30d.reduce((sum, order) => {
    const total = parseFloat(order.total || '0');
    const refunded = parseFloat(order.total_refunded || '0');
    return sum + (total - refunded);
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
    <div className="space-y-10">
      <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Riadiaca doska</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Rýchly prehľad objednávok, obsahu a zdravia kampaní. Čísla sú zatiaľ statické – napojíme na API, keď budú dostupné.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25">
              Exportovať prehľad
            </button>
            <button className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100">
              Nastavenia
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-emerald-900/10"
          >
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
            <p className="mt-2 text-xs font-medium text-emerald-300">{metric.change || 'Aktualizované z WooCommerce'}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Posledné objednávky</h2>
            <button className="text-sm text-emerald-300 hover:text-emerald-200">Zobraziť všetky</button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            {recentOrders.length ? (
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-900/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Zákazník</th>
                    <th className="px-4 py-3 text-left font-medium">Celkom</th>
                    <th className="px-4 py-3 text-left font-medium">Stav</th>
                    <th className="px-4 py-3 text-left font-medium">Platba / doprava</th>
                    <th className="px-4 py-3 text-left font-medium">Dátum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {recentOrders.map((order) => {
                    const hasName = order.billing?.first_name || order.billing?.last_name;
                    const customerName = hasName
                      ? `${order.billing?.first_name ?? ''} ${order.billing?.last_name ?? ''}`.trim()
                      : '—';

                    return (
                    <tr key={order.id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3 font-semibold text-white">#{order.id}</td>
                      <td className="px-4 py-3 text-slate-200">{customerName}</td>
                      <td className="px-4 py-3 text-slate-100">{formatCurrency(parseFloat(order.total || '0'))}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {order.payment_method_title || order.shipping_lines?.[0]?.method_title || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{formatDate(order.date_created)}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="bg-slate-950/40 px-6 py-5 text-sm text-slate-300">
                Nepodarilo sa načítať objednávky alebo žiadne nie sú k dispozícii.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
