import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { statusClass, statusLabels } from '@/app/admin/orders/constants';

type PageProps = {
  params?: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

const paymentMethodLabels: Record<string, string> = {
  cod: 'Dobierka',
  stripe: 'Stripe',
  bank_transfer: 'Bankový prevod',
  other: 'Iné',
};

const formatCurrency = (value: Prisma.Decimal | string | number | undefined, currency: string) => {
  const numericValue = value ? Number(value) : 0;
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (value?: Date | string) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default async function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = params ? await params : undefined;
  const orderId = resolvedParams?.id;
  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      addresses: true,
      items: true,
      meta: true,
    },
  });

  if (!order) {
    notFound();
  }

  const billingAddress = order.addresses.find(address => address.type === 'BILLING');
  const shippingAddress = order.addresses.find(address => address.type === 'SHIPPING');
  const rawInvoiceUrl = order.meta.find(m => m.key === '_invoice_url')?.value;
  const invoiceUrl = rawInvoiceUrl?.startsWith('http') ? rawInvoiceUrl : rawInvoiceUrl ? `https://${rawInvoiceUrl.replace(/^\/+/, '')}` : null;
  const invoiceNumber = order.meta.find(m => m.key === '_invoice_number')?.value;

  const orderNumberLabel = order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`;

  const addressLine = (address?: (typeof order.addresses)[number]) => {
    if (!address) return <p className="text-sm text-slate-300">—</p>;
    return (
      <>
        <p className="text-sm font-semibold text-white">
          {[address.firstName, address.lastName].filter(Boolean).join(' ') || '—'}
        </p>
        {address.company ? <p className="text-sm text-slate-300">{address.company}</p> : null}
        <p className="text-sm text-slate-300">
          {address.address1}
          {address.address2 ? `, ${address.address2}` : ''}
        </p>
        <p className="text-sm text-slate-300">
          {address.postcode} {address.city}
        </p>
        <p className="text-sm text-slate-300">{address.country}</p>
        {address.email ? (
          <p className="text-sm text-slate-300">Email: {address.email}</p>
        ) : null}
        {address.phone ? (
          <p className="text-sm text-slate-300">Tel: {address.phone}</p>
        ) : null}
      </>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Objednávka</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">
              {orderNumberLabel} · {order.addresses?.find(a => a.type === 'BILLING')?.email || order.id}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Vytvorená {formatDate(order.createdAt)} ({statusLabels[order.status] || order.status})
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/orders"
              className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100"
            >
              Späť na objednávky
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stav objednávky</p>
            <div className="mt-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(order.status)}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Platba</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {formatCurrency(order.total, order.currency)}
            </p>
            <p className="text-sm text-slate-300">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stav platby</p>
            <p className="mt-2 text-lg font-semibold text-white">{order.paymentStatus}</p>
            <p className="text-sm text-slate-500">Mena: {order.currency}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Platobná metóda</p>
            <p className="mt-2 text-lg font-semibold text-white">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
            <p className="text-sm text-slate-300">Transakcia {order.transactionId || '—'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Medzisúčet</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(order.subtotal, order.currency)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Doprava</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(order.shippingTotal, order.currency)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Daň</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(order.taxTotal, order.currency)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Zľava</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(order.discountTotal, order.currency)}</p>
          </div>
        </div>
      </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fakturačná adresa</p>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              {addressLine(billingAddress)}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Dodacia adresa</p>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              {addressLine(shippingAddress)}
            </div>
          </div>
        </div>

        {order.customerNote ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Poznámka zákazníka</p>
            <p className="mt-2 text-sm text-slate-200">{order.customerNote}</p>
          </div>
        ) : null}
        </div>

        {invoiceUrl && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Faktúra</p>
            <div className="mt-2">
              <Link
                href={invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-emerald-300 hover:text-emerald-200 underline flex items-center gap-2"
              >
                <span>Stiahnuť faktúru {invoiceNumber ? `(${invoiceNumber})` : ''}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75h-15m7.5-7.5v15" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Položky objednávky</h2>
            <p className="text-sm text-slate-300">{order.items.length} položiek</p>
          </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Produkt</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-right font-medium">Cena</th>
                <th className="px-4 py-3 text-right font-medium">Množstvo</th>
                <th className="px-4 py-3 text-right font-medium">Spolu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/30">
              {order.items.map(item => (
                <tr key={item.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 text-slate-100">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-300">{item.sku || '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-200">{formatCurrency(item.price, order.currency)}</td>
                  <td className="px-4 py-3 text-right text-slate-200">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold text-white">{formatCurrency(item.total, order.currency)}</td>
                </tr>
              ))}
              {order.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-300">
                    Žiadne položky v objednávke.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
