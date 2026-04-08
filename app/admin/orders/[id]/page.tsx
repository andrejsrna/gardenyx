import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { statusClass, statusLabels } from '@/app/admin/orders/constants';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { Builder, Parser } from 'xml2js';

type PageProps = {
  params?: Promise<{ id: string }>;
};

type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; addresses: true; meta: true } }>;

type PacketaCreatePacketResponse = {
  response?: {
    status?: string;
    string?: string;
    message?: string;
    result?: {
      id?: string;
      barcode?: string;
      barcodeText?: string;
    };
  };
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

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_CARRIER_ID = '131';
const PACKETA_ESHOP_ID = process.env.PACKETA_ESHOP_ID || 'FITDOPLNKY';

function parseAddress(addressLine: string): { street: string; houseNumber: string } {
  if (!addressLine) return { street: '', houseNumber: '' };
  const match = addressLine.match(/^(.*?)\s*([\d/A-Za-z-]+)$/);
  if (match && match[2] && /\d/.test(match[2])) {
    return { street: (match[1] || '').trim(), houseNumber: match[2].trim() };
  }
  return { street: addressLine.trim(), houseNumber: '' };
}

function calculateTotalWeight(items: Array<{ quantity: number }>): number {
  return items.reduce((total, item) => total + (Number(item.quantity || 0) * 0.5), 0);
}

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
  const packetaError = order.meta.find(m => m.key === '_packeta_error')?.value || null;
  const packetaErrorAt = order.meta.find(m => m.key === '_packeta_error_at')?.value || null;

  const rawInvoiceUrl = order.meta.find(m => m.key === '_invoice_url')?.value;
  const invoiceUrl = rawInvoiceUrl?.startsWith('http') ? rawInvoiceUrl : rawInvoiceUrl ? `https://${rawInvoiceUrl.replace(/^\/+/, '')}` : null;
  const invoiceNumber = order.meta.find(m => m.key === '_invoice_number')?.value;

  const orderNumberLabel = order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`;

  async function retryPacketaAndResend() {
    'use server';

    const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
    if (!PACKETA_API_PASSWORD) {
      throw new Error('Missing PACKETA_API_SECRET');
    }

    const fresh = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, addresses: true, meta: true }
    }) as OrderWithRelations | null;
    if (!fresh) throw new Error('Order not found');

    const billing = fresh.addresses.find(a => a.type === 'BILLING');
    const shipping = fresh.addresses.find(a => a.type === 'SHIPPING');
    if (!billing?.email) throw new Error('Missing billing email');
    if (!shipping) throw new Error('Missing shipping address');

    // Keep in processing.
    await prisma.order.update({ where: { id: orderId }, data: { status: 'processing' } });

    // Resend emails (best-effort)
    await sendOrderConfirmationEmail(fresh, billing.email);
    await sendOrderNotificationToAdmin(fresh, billing.email);

    // Recreate Packeta packet
    const packetAttributes: Record<string, string | undefined> = {
      number: String(fresh.orderNumber ?? fresh.id),
      name: shipping.firstName,
      surname: shipping.lastName,
      email: billing.email,
      phone: String(billing.phone || '').replace(/[^\d]/g, ''),
      value: String(fresh.total),
      currency: String(fresh.currency || 'EUR'),
      weight: String(calculateTotalWeight(fresh.items)),
      eshop_id: PACKETA_ESHOP_ID,
      cod: fresh.paymentMethod === 'cod' ? String(fresh.total) : undefined,
    };

    const isHomeDelivery = fresh.shippingMethod === 'packeta_home';
    if (isHomeDelivery) {
      let addressLine = shipping.address1;
      let parsed = parseAddress(addressLine);
      if (!parsed.street && shipping.address2) {
        addressLine = shipping.address2;
        parsed = parseAddress(addressLine);
      }
      if (!parsed.street) throw new Error(`Invalid address for home delivery: ${addressLine}`);

      Object.assign(packetAttributes, {
        addressId: PACKETA_CARRIER_ID,
        street: parsed.street,
        houseNumber: parsed.houseNumber,
        city: shipping.city,
        zip: String(shipping.postcode || '').replace(/\s/g, ''),
        country: String(shipping.country || 'SK'),
      });
    } else {
      const pointId = fresh.packetaPointId || fresh.meta.find(m => m.key === '_packeta_point_id')?.value;
      if (!pointId) throw new Error('Missing Packeta point id');
      Object.assign(packetAttributes, { addressId: String(pointId) });
    }

    const xmlData = { createPacket: { apiPassword: PACKETA_API_PASSWORD, packetAttributes } };
    const builder = new Builder({
      renderOpts: { pretty: true, indent: '  ' },
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    const xmlRequest = builder.buildObject(xmlData);

    const resp = await fetch(PACKETA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml', 'Accept': 'application/xml' },
      body: xmlRequest
    });
    const respText = await resp.text();
    if (!resp.ok) throw new Error(`Packeta HTTP ${resp.status}: ${resp.statusText} :: ${respText}`);

    const parser = new Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(respText) as PacketaCreatePacketResponse;
    if (result?.response?.status !== 'ok') {
      throw new Error(result?.response?.string || result?.response?.message || `Packeta status: ${result?.response?.status}`);
    }
    const r = result.response.result;
    if (!r?.id || !r?.barcode || !r?.barcodeText) throw new Error('Packeta response missing result fields');

    // Store new packeta meta + clear error meta.
    await prisma.orderMeta.deleteMany({
      where: {
        orderId,
        key: { in: ['_packeta_packet_id', '_packeta_barcode', '_packeta_barcode_text', '_packeta_error', '_packeta_error_at'] }
      }
    });
    await prisma.orderMeta.createMany({
      data: [
        { orderId: String(orderId), key: '_packeta_packet_id', value: String(r.id) },
        { orderId: String(orderId), key: '_packeta_barcode', value: String(r.barcode) },
        { orderId: String(orderId), key: '_packeta_barcode_text', value: String(r.barcodeText) },
      ]
    });
  }

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

        {packetaError ? (
          <div className="mt-6 rounded-2xl border border-rose-700/50 bg-rose-950/30 p-4 text-rose-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-200/80">Packeta chyba</p>
                <p className="mt-1 text-sm text-rose-100 break-words">{packetaError}</p>
                {packetaErrorAt ? (
                  <p className="mt-1 text-xs text-rose-200/70">Čas: {packetaErrorAt}</p>
                ) : null}
              </div>
              <form action={retryPacketaAndResend}>
                <button
                  type="submit"
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                >
                  Retry Packeta + email
                </button>
              </form>
            </div>
          </div>
        ) : null}

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
