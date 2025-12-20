import Link from 'next/link';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import prisma from '@/app/lib/prisma';
import { fetchPacketaStatus, hasPacketaCredentials, mapPacketaStatusToOrderStatus } from '@/app/lib/packeta-status';
import { statusClass, statusLabels } from '@/app/admin/orders/constants';

export const dynamic = 'force-dynamic';

type Order = {
  id: string;
  status: string;
  total: Prisma.Decimal;
  currency: string;
  addresses: Array<{
    type: string;
    firstName: string;
    lastName: string;
    email: string | null;
  }>;
  paymentMethod: string;
  createdAt: string;
  meta: Array<{
    key: string;
    value: string | null;
  }>;
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

const getMetaValue = (order: Order, key: string) => order.meta?.find(m => m.key === key)?.value || null;

async function ensurePacketaStatuses(orders: Order[]) {
  if (!hasPacketaCredentials()) return;

  const ordersToSync = orders.filter(order =>
    getMetaValue(order, '_packeta_packet_id') && !getMetaValue(order, '_packeta_status_text')
  );

  for (const order of ordersToSync) {
    const packetId = getMetaValue(order, '_packeta_packet_id');
    if (!packetId) continue;

    try {
      const status = await fetchPacketaStatus(packetId);
      const newStatus = mapPacketaStatusToOrderStatus(status.code);

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: newStatus,
            paymentStatus: newStatus === OrderStatus.completed ? PaymentStatus.paid : undefined,
          }
        });

        const existingCode = await tx.orderMeta.findFirst({
          where: { orderId: order.id, key: '_packeta_status_code' }
        });
        if (existingCode) {
          await tx.orderMeta.update({ where: { id: existingCode.id }, data: { value: String(status.code) } });
        } else {
          await tx.orderMeta.create({ data: { orderId: order.id, key: '_packeta_status_code', value: String(status.code) } });
        }

        const existingText = await tx.orderMeta.findFirst({
          where: { orderId: order.id, key: '_packeta_status_text' }
        });
        if (existingText) {
          await tx.orderMeta.update({ where: { id: existingText.id }, data: { value: status.text } });
        } else {
          await tx.orderMeta.create({ data: { orderId: order.id, key: '_packeta_status_text', value: status.text } });
        }
      });

      order.status = newStatus;
      order.meta = [
        ...order.meta.filter(m => m.key !== '_packeta_status_code' && m.key !== '_packeta_status_text'),
        { key: '_packeta_status_code', value: String(status.code) },
        { key: '_packeta_status_text', value: status.text }
      ];
    } catch (error) {
      console.warn(`[admin packeta sync] failed for order ${order.id}`, error);
    }
  }
}

async function deleteOrderAction(formData: FormData) {
  'use server';
  const id = formData.get('orderId');
  if (!id || typeof id !== 'string') {
    throw new Error('Missing order id');
  }
  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/orders');
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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (currentPage - 1) * perPage,
      include: { addresses: true, meta: true }
    }) as unknown as Promise<Order[]>,
    prisma.order.count()
  ]);

  await ensurePacketaStatuses(orders);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Objednávky</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Správa objednávok</h1>
            <p className="mt-2 text-sm text-slate-300">Posledné objednávky z internej DB (stránkovanie po {perPage}).</p>
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
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
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
                <th className="px-4 py-3 text-left font-medium">Packeta</th>
                <th className="px-4 py-3 text-left font-medium">Faktúra</th>
                <th className="px-4 py-3 text-left font-medium">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-emerald-200 hover:text-emerald-100 underline-offset-4 hover:underline"
                      title="Zobraziť objednávku"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {(() => {
                      const billing = order.addresses?.find(a => a.type === 'BILLING');
                      return billing ? [billing.firstName, billing.lastName].filter(Boolean).join(' ') || '—' : '—';
                    })()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {order.addresses?.find(a => a.type === 'BILLING')?.email || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(order.status)}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{order.paymentMethod || '—'}</td>
                  <td className="px-4 py-3 text-slate-100">
                    {order.total?.toString()} {order.currency}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {(() => {
                      const code = getMetaValue(order, '_packeta_status_code');
                      const text = getMetaValue(order, '_packeta_status_text');
                      const barcode = getMetaValue(order, '_packeta_barcode');
                      const packetId = getMetaValue(order, '_packeta_packet_id');
                      const trackingId = barcode || packetId;
                      const display = text || (code ? `Status ${code}` : packetId ? `Zásielka ${packetId}` : '—');

                      if (trackingId) {
                        return (
                          <Link
                            href={`https://tracking.packeta.com/sk/?id=${trackingId}`}
                            className="text-emerald-200 hover:text-emerald-100 underline"
                            title={packetId || undefined}
                          >
                            {display}
                          </Link>
                        );
                      }
                      return display;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {(() => {
                      const rawInvoiceUrl = getMetaValue(order, '_invoice_url');
                      const invoiceUrl = rawInvoiceUrl?.startsWith('http') ? rawInvoiceUrl : rawInvoiceUrl ? `https://${rawInvoiceUrl.replace(/^\/+/, '')}` : null;
                      const invoiceNumber = getMetaValue(order, '_invoice_number');
                      if (!invoiceUrl) return '—';
                      return (
                        <Link
                          href={invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-emerald-300 underline hover:text-emerald-200"
                        >
                          {invoiceNumber ? `Stiahnuť (${invoiceNumber})` : 'Stiahnuť faktúru'}
                        </Link>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400/70 hover:text-emerald-100"
                      >
                        Detaily
                      </Link>
                      <form action={deleteOrderAction}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:border-rose-300 hover:text-white"
                        >
                          Vymazať
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-300">
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
