import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { statusClass, statusLabels } from '@/app/admin/orders/constants';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin, sendPaymentMethodChangedEmail } from '@/app/lib/email/order-confirmation';
import { createPacketaPacketForOrder } from '@/app/lib/packeta';
import { createInvoiceForOrder } from '@/app/lib/invoice/create-invoice';

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

const inputClass = 'mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none';

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

  const packetaPacketId = order.meta.find(m => m.key === '_packeta_packet_id')?.value || null;

  const paymentChangedAt = order.meta.find(m => m.key === '_payment_method_changed_at')?.value || null;
  const paymentChangedFrom = order.meta.find(m => m.key === '_payment_method_changed_from')?.value || null;
  const canChangePayment = order.paymentMethod === 'stripe'
    && order.status !== 'completed'
    && order.status !== 'cancelled'
    && order.status !== 'refunded';

  const orderNumberLabel = order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`;
  const hasDiscount = order.discountTotal && Number(order.discountTotal) > 0;

  // Definitívny string id (orderId z params je string | undefined a TS ho v nested
  // server action closurách nezúži; order.id je po notFound() guarde vždy string).
  const id = order.id;

  async function generateInvoiceAction() {
    'use server';
    const fresh = await prisma.order.findUnique({
      where: { id },
      include: { items: true, addresses: true, meta: true }
    });
    if (!fresh) throw new Error('Order not found');
    await createInvoiceForOrder(fresh, { force: true });
    revalidatePath(`/admin/orders/${id}`);
  }

  async function retryPacketaAndResend() {
    'use server';

    const fresh = await prisma.order.findUnique({
      where: { id },
      include: { items: true, addresses: true, meta: true }
    });
    if (!fresh) throw new Error('Order not found');

    const billing = fresh.addresses.find(a => a.type === 'BILLING');
    if (!billing?.email) throw new Error('Missing billing email');
    if (!fresh.addresses.find(a => a.type === 'SHIPPING')) throw new Error('Missing shipping address');

    // Keep in processing.
    await prisma.order.update({ where: { id }, data: { status: 'processing' } });

    // Resend emails (best-effort)
    await sendOrderConfirmationEmail(fresh, billing.email);
    await sendOrderNotificationToAdmin(fresh, billing.email);

    // Recreate Packeta packet + clear previous error.
    await createPacketaPacketForOrder(id, { force: true });
    await prisma.orderMeta.deleteMany({
      where: { orderId: id, key: { in: ['_packeta_error', '_packeta_error_at'] } }
    });

    redirect(`/admin/orders/${id}`);
  }

  async function regeneratePacketa() {
    'use server';

    try {
      await createPacketaPacketForOrder(id, { force: true });
      await prisma.orderMeta.deleteMany({
        where: { orderId: id, key: { in: ['_packeta_error', '_packeta_error_at'] } }
      });
    } catch (err) {
      // Nezhadzuj klienta — chybu ulož a zobraz ju v UI (červený box).
      const message = err instanceof Error ? err.message : String(err);
      const nowIso = new Date().toISOString();
      await prisma.orderMeta.upsert({
        where: { orderId_key: { orderId: id, key: '_packeta_error' } },
        create: { orderId: id, key: '_packeta_error', value: message },
        update: { value: message },
      });
      await prisma.orderMeta.upsert({
        where: { orderId_key: { orderId: id, key: '_packeta_error_at' } },
        create: { orderId: id, key: '_packeta_error_at', value: nowIso },
        update: { value: nowIso },
      });
    }

    redirect(`/admin/orders/${id}`);
  }

  async function saveShippingAddress(formData: FormData) {
    'use server';

    const get = (key: string) => String(formData.get(key) ?? '').trim();
    const data = {
      firstName: get('firstName'),
      lastName: get('lastName'),
      company: get('company') || null,
      address1: get('address1'),
      address2: get('address2') || null,
      city: get('city'),
      postcode: get('postcode'),
      country: get('country') || 'SK',
      phone: get('phone') || null,
      email: get('email') || null,
    };

    await prisma.orderAddress.upsert({
      where: { orderId_type: { orderId: id, type: 'SHIPPING' } },
      update: data,
      create: { orderId: id, type: 'SHIPPING', ...data },
    });

    redirect(`/admin/orders/${id}`);
  }

  // Vygeneruje Packetu na DODACIU adresu (doručenie domov) aj keď bola objednávka
  // pôvodne na výdajné miesto. Prepne shippingMethod na packeta_home, aby
  // createPacketaPacketForOrder použil adresu namiesto výdajného miesta.
  async function regeneratePacketaHome() {
    'use server';

    try {
      await prisma.order.update({ where: { id }, data: { shippingMethod: 'packeta_home' } });
      await createPacketaPacketForOrder(id, { force: true });
      await prisma.orderMeta.deleteMany({
        where: { orderId: id, key: { in: ['_packeta_error', '_packeta_error_at'] } }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const nowIso = new Date().toISOString();
      await prisma.orderMeta.upsert({
        where: { orderId_key: { orderId: id, key: '_packeta_error' } },
        create: { orderId: id, key: '_packeta_error', value: message },
        update: { value: message },
      });
      await prisma.orderMeta.upsert({
        where: { orderId_key: { orderId: id, key: '_packeta_error_at' } },
        create: { orderId: id, key: '_packeta_error_at', value: nowIso },
        update: { value: nowIso },
      });
    }

    redirect(`/admin/orders/${id}`);
  }

  async function changePaymentToCOD() {
    'use server';

    const fresh = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, addresses: true, meta: true },
    });
    if (!fresh) throw new Error('Order not found');
    if (fresh.paymentMethod === 'cod') throw new Error('Objednávka už je na dobierku');
    if (fresh.status === 'completed' || fresh.status === 'cancelled' || fresh.status === 'refunded') {
      throw new Error(`Nedá sa zmeniť platba pri objednávke so stavom ${fresh.status}`);
    }

    const billing = fresh.addresses.find(a => a.type === 'BILLING');
    if (!billing?.email) throw new Error('Missing billing email');

    const oldMethod = fresh.paymentMethod;

    // 1. Cancel existing Stripe PaymentIntent if present
    const stripePIId = fresh.transactionId
      || fresh.meta.find(m => m.key === '_stripe_payment_intent_id')?.value
      || null;
    let stripeCancelled = false;
    if (stripePIId && oldMethod === 'stripe') {
      try {
        const { getStripe } = await import('@/app/lib/stripe');
        const stripe = getStripe();
        const pi = await stripe.paymentIntents.retrieve(stripePIId);
        if (pi.status === 'succeeded') {
          throw new Error('Stripe platba už prebehla — treba refund, nie cancel');
        }
        if (pi.status !== 'canceled') {
          await stripe.paymentIntents.cancel(stripePIId, { cancellation_reason: 'requested_by_customer' });
        }
        stripeCancelled = true;
      } catch (err) {
        // If cancel fails because PI doesn't exist or already canceled, continue
        console.warn('[changePaymentToCOD] Stripe cancel skipped:', err instanceof Error ? err.message : err);
      }
    }

    // 2. Update order payment method to COD
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: 'cod',
        paymentStatus: 'pending',
      },
    });

    // 3. Create new Packeta packet WITH COD (force replaces old one)
    const needsPacketa = fresh.shippingMethod === 'packeta_home' || fresh.shippingMethod === 'packeta_pickup';
    if (needsPacketa) {
      await createPacketaPacketForOrder(String(orderId), { force: true });
    }

    // 4. Send notification email to customer
    await sendPaymentMethodChangedEmail(fresh, billing.email, oldMethod, 'cod');

    // 5. Store audit meta
    const nowIso = new Date().toISOString();
    await prisma.orderMeta.upsert({
      where: { orderId_key: { orderId: String(orderId), key: '_payment_method_changed_at' } },
      create: { orderId: String(orderId), key: '_payment_method_changed_at', value: nowIso },
      update: { value: nowIso },
    });
    await prisma.orderMeta.upsert({
      where: { orderId_key: { orderId: String(orderId), key: '_payment_method_changed_from' } },
      create: { orderId: String(orderId), key: '_payment_method_changed_from', value: oldMethod },
      update: { value: oldMethod },
    });
    await prisma.orderMeta.upsert({
      where: { orderId_key: { orderId: String(orderId), key: '_payment_method_changed_to' } },
      create: { orderId: String(orderId), key: '_payment_method_changed_to', value: 'cod' },
      update: { value: 'cod' },
    });
    if (stripeCancelled) {
      await prisma.orderMeta.upsert({
        where: { orderId_key: { orderId: String(orderId), key: '_stripe_pi_cancelled_at' } },
        create: { orderId: String(orderId), key: '_stripe_pi_cancelled_at', value: nowIso },
        update: { value: nowIso },
      });
    }

    redirect(`/admin/orders/${id}`);
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
          <div className="flex flex-wrap gap-3">
            {packetaPacketId && (
              <Link
                href={`/api/admin/orders/${orderId}/packeta-label`}
                target="_blank"
                className="rounded-full border border-emerald-600/60 bg-emerald-600/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:text-emerald-100"
              >
                Stiahnuť štítok Packeta
              </Link>
            )}
            <form action={regeneratePacketa}>
              <button
                type="submit"
                className="rounded-full border border-amber-600/60 bg-amber-600/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-amber-400 hover:text-amber-100"
              >
                {packetaPacketId ? 'Pregenerovať Packeta' : 'Vygenerovať Packeta'}
              </button>
            </form>
            <form action={regeneratePacketaHome}>
              <button
                type="submit"
                className="rounded-full border border-sky-600/60 bg-sky-600/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-400 hover:text-sky-100"
              >
                Packeta na dodaciu adresu (domov)
              </button>
            </form>
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

        {(canChangePayment || paymentChangedAt) && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Zmena spôsobu platby</p>
            {paymentChangedAt && (
              <p className="mb-3 text-sm text-slate-300">
                Platba zmenená z <span className="font-semibold text-amber-200">{paymentChangedFrom === 'stripe' ? 'karty' : paymentChangedFrom}</span> na <span className="font-semibold text-emerald-200">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span> · {formatDate(paymentChangedAt)}
              </p>
            )}
            {canChangePayment && (
              <form action={changePaymentToCOD}>
                <button
                  type="submit"
                  className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500"
                >
                  Zmeniť na dobierku
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  Zruší sa Stripe platba, vytvorí sa nový Packeta štítok s dobierkou a zákazník dostane email.
                </p>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Cenový súhrn</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Medzisúčet</span>
              <span>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Zľava</span>
                <span>− {formatCurrency(order.discountTotal, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Doprava</span>
              <span>{formatCurrency(order.shippingTotal, order.currency)}</span>
            </div>
            {Number(order.taxTotal) > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>DPH</span>
                <span>{formatCurrency(order.taxTotal, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-700 pt-2 text-base font-semibold text-white">
              <span>Celkom</span>
              <span>{formatCurrency(order.total, order.currency)}</span>
            </div>
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
            <form action={saveShippingAddress} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400">Meno</span>
                  <input name="firstName" required defaultValue={shippingAddress?.firstName || ''} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Priezvisko</span>
                  <input name="lastName" required defaultValue={shippingAddress?.lastName || ''} className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-slate-400">Firma</span>
                <input name="company" defaultValue={shippingAddress?.company || ''} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Ulica a číslo</span>
                <input name="address1" required defaultValue={shippingAddress?.address1 || ''} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Doplnok adresy</span>
                <input name="address2" defaultValue={shippingAddress?.address2 || ''} className={inputClass} />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400">PSČ</span>
                  <input name="postcode" required defaultValue={shippingAddress?.postcode || ''} className={inputClass} />
                </label>
                <label className="block col-span-2">
                  <span className="text-xs text-slate-400">Mesto</span>
                  <input name="city" required defaultValue={shippingAddress?.city || ''} className={inputClass} />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400">Krajina</span>
                  <input name="country" defaultValue={shippingAddress?.country || 'SK'} className={inputClass} />
                </label>
                <label className="block col-span-2">
                  <span className="text-xs text-slate-400">Telefón</span>
                  <input name="phone" defaultValue={shippingAddress?.phone || ''} className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-slate-400">Email</span>
                <input name="email" type="email" defaultValue={shippingAddress?.email || ''} className={inputClass} />
              </label>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Uložiť dodaciu adresu
              </button>
            </form>
          </div>
        </div>

        {order.customerNote ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Poznámka zákazníka</p>
            <p className="mt-2 text-sm text-slate-200">{order.customerNote}</p>
          </div>
        ) : null}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Faktúra</p>
              {invoiceUrl ? (
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
              ) : (
                <p className="mt-1 text-sm text-slate-400">Faktúra nebola vygenerovaná.</p>
              )}
            </div>
            <form action={generateInvoiceAction}>
              <button
                type="submit"
                className="rounded-full border border-emerald-600/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:text-emerald-100 whitespace-nowrap"
              >
                {invoiceUrl ? 'Regenerovať faktúru' : 'Vytvoriť faktúru'}
              </button>
            </form>
          </div>
        </div>

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
