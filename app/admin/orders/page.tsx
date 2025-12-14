import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import Link from 'next/link';

type Order = {
  id: number;
  status: string;
  total: string;
  currency: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  shipping?: {
    city?: string;
  };
  payment_method_title?: string;
  date_created?: string;
};

const statusLabels: Record<string, string> = {
  pending: 'Čaká na platbu',
  processing: 'Spracovanie',
  on_hold: 'Pozdržané',
  completed: 'Doručené',
  cancelled: 'Zrušené',
  refunded: 'Vrátené',
  failed: 'Zlyhalo',
};

const statusClass = (status: string) => {
  switch (status) {
    case 'processing':
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-200';
    case 'pending':
    case 'on_hold':
      return 'bg-amber-500/15 text-amber-200';
    default:
      return 'bg-rose-500/15 text-rose-200';
  }
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const getWooClient = () => {
  const url = process.env.WORDPRESS_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;
  if (!url || !consumerKey || !consumerSecret) {
    throw new Error('WooCommerce credentials are missing');
  }
  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: 'wc/v3',
  });
};

async function fetchOrders(page: number, perPage: number): Promise<{ orders: Order[]; total: number }> {
  const api = getWooClient();
  const { data, headers } = await api.get('orders', {
    per_page: perPage,
    page,
    orderby: 'date',
    order: 'desc',
  });
  const total = Number(headers?.['x-wp-total'] || data.length || 0);
  return { orders: data as Order[], total };
}

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  } | undefined>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const perPage = 25;
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params?.page) || 1);

  let orders: Order[] = [];
  let total = 0;
  try {
    const result = await fetchOrders(currentPage, perPage);
    orders = result.orders;
    total = result.total;
  } catch (error) {
    console.error('[admin-orders] Failed to fetch orders', error);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Objednávky</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Správa objednávok</h1>
            <p className="mt-2 text-sm text-slate-300">Posledné objednávky z WooCommerce (stránkovanie po {perPage}).</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100"
            >
              Späť na dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Posledné objednávky</h2>
          <span className="text-sm text-slate-300">Spolu: {total}</span>
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">#{order.id}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {[order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{order.billing?.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(order.status)}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{order.payment_method_title || '—'}</td>
                  <td className="px-4 py-3 text-slate-100">
                    {order.total} {order.currency}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(order.date_created)}</td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-300">
                    Nepodarilo sa načítať objednávky.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-sm text-slate-300">
            <span>Strana {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <Link
                href={`/admin/orders?page=${Math.max(1, currentPage - 1)}`}
                className={`rounded-lg px-3 py-2 ${currentPage === 1 ? 'cursor-not-allowed border border-slate-800 text-slate-600' : 'border border-slate-700 text-slate-200 hover:border-emerald-400/70'}`}
                aria-disabled={currentPage === 1}
              >
                Predchádzajúca
              </Link>
              <Link
                href={`/admin/orders?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`rounded-lg px-3 py-2 ${currentPage >= totalPages ? 'cursor-not-allowed border border-slate-800 text-slate-600' : 'border border-slate-700 text-slate-200 hover:border-emerald-400/70'}`}
                aria-disabled={currentPage >= totalPages}
              >
                Ďalšia
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
