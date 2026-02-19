import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { Builder, Parser } from 'xml2js';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
const PACKETA_CARRIER_ID = '131';

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || request.nextUrl.searchParams.get('token');
  const expected = process.env.NEWSLETTER_ADMIN_TOKEN || process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) return false;
  if (!token) return false;
  return token === expected;
}

type Meta = { key: string; value: string | null };

function getMeta(meta: Meta[] | undefined, key: string) {
  return meta?.find(m => m.key === key)?.value ?? null;
}

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

async function recreatePacketaPacket(order: any) {
  if (!PACKETA_API_PASSWORD) throw new Error('Missing PACKETA_API_SECRET');

  const shippingMethod = order.shippingMethod;
  const isHomeDelivery = shippingMethod === 'packeta_home';

  const billing = order.addresses.find((a: any) => a.type === 'BILLING');
  const shipping = order.addresses.find((a: any) => a.type === 'SHIPPING');
  if (!billing || !shipping) throw new Error('Missing billing/shipping addresses');

  const packetAttributes: Record<string, string | undefined> = {
    number: String(order.orderNumber ?? order.id),
    name: shipping.firstName,
    surname: shipping.lastName,
    email: billing.email,
    phone: String(billing.phone || '').replace(/[^\d]/g, ''),
    value: String(order.total),
    currency: String(order.currency || 'EUR'),
    weight: String(calculateTotalWeight(order.items)),
    eshop: 'FITDOPLNKY',
    cod: order.paymentMethod === 'cod' ? String(order.total) : undefined,
  };

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
    const pointId = order.packetaPointId || getMeta(order.meta, '_packeta_point_id');
    if (!pointId) throw new Error('Missing Packeta point id');
    Object.assign(packetAttributes, { addressId: String(pointId) });
  }

  const xmlData = {
    createPacket: {
      apiPassword: PACKETA_API_PASSWORD,
      packetAttributes,
    },
  };

  const builder = new Builder({
    renderOpts: { pretty: true, indent: '  ' },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  });

  const xmlRequest = builder.buildObject(xmlData);

  const resp = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', 'Accept': 'application/xml' },
    body: xmlRequest,
  });

  const respText = await resp.text();
  if (!resp.ok) throw new Error(`Packeta HTTP ${resp.status}: ${resp.statusText} :: ${respText}`);

  const parser = new Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(respText) as any;

  if (result?.response?.status !== 'ok') {
    throw new Error(result?.response?.string || result?.response?.message || `Packeta status: ${result?.response?.status}`);
  }

  const r = result.response.result;
  if (!r?.id || !r?.barcode || !r?.barcodeText) throw new Error('Packeta response missing result fields');

  await prisma.orderMeta.deleteMany({
    where: {
      orderId: order.id,
      key: { in: ['_packeta_packet_id', '_packeta_barcode', '_packeta_barcode_text'] },
    },
  });
  await prisma.orderMeta.createMany({
    data: [
      { orderId: order.id, key: '_packeta_packet_id', value: String(r.id) },
      { orderId: order.id, key: '_packeta_barcode', value: String(r.barcode) },
      { orderId: order.id, key: '_packeta_barcode_text', value: String(r.barcodeText) },
    ],
  });

  return { id: String(r.id), barcode: String(r.barcode), barcodeText: String(r.barcodeText) };
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, addresses: true, meta: true },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // set processing
  await prisma.order.update({ where: { id }, data: { status: 'processing' } });

  const billingEmail = order.addresses.find(a => a.type === 'BILLING')?.email || null;
  if (!billingEmail) return NextResponse.json({ error: 'Missing billing email' }, { status: 400 });

  // resend emails
  await sendOrderConfirmationEmail(order as any, billingEmail);
  await sendOrderNotificationToAdmin(order as any, billingEmail);

  // recreate packeta packet
  const packeta = await recreatePacketaPacket(order as any);

  return NextResponse.json({ ok: true, orderId: id, email: billingEmail, status: 'processing', packeta });
}
