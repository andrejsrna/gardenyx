import { Builder, Parser } from 'xml2js';
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { PACKETA_HOME_CARRIER_IDS } from '@/app/lib/checkout/constants';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_ESHOP_ID = process.env.PACKETA_ESHOP_ID || 'FITDOPLNKY';
const DEFAULT_WEIGHT_KG = 0.5;

function parseAddress(addressLine: string): { street: string; houseNumber: string } {
  if (!addressLine) return { street: '', houseNumber: '' };
  const match = addressLine.match(/^(.*?)\s*([\d/A-Za-z-]+)$/);
  if (match && match[2] && /\d/.test(match[2])) {
    return { street: (match[1] || '').trim(), houseNumber: match[2].trim() };
  }
  return { street: addressLine.trim(), houseNumber: '' };
}

type OrderItemWithProduct = {
  productId: bigint;
  variationId: bigint | null;
  quantity: number;
};

/**
 * Calculate total weight for order items by looking up actual product/variant
 * weights from the database. Falls back to DEFAULT_WEIGHT_KG per item if no
 * weight is set on the product or variant.
 */
export async function calculateTotalWeight(items: OrderItemWithProduct[]): Promise<number> {
  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  if (productIds.length === 0) return 0;

  const products = await prisma.product.findMany({
    where: { wcId: { in: productIds } },
    select: { wcId: true, weight: true, variants: true },
  });

  const productMap = new Map<string, { weight: Prisma.Decimal | null; variants: unknown }>();
  for (const p of products) {
    productMap.set(p.wcId.toString(), p);
  }

  let total = 0;
  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    let itemWeight: number | null = null;

    if (product && item.variationId) {
      // Try to find weight in the specific variant
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const variant = variants.find(
        (v: Record<string, unknown>) => typeof v === 'object' && v !== null && Number(v.id) === Number(item.variationId),
      ) as Record<string, unknown> | undefined;
      if (variant && typeof variant.weight === 'number' && Number.isFinite(variant.weight)) {
        itemWeight = variant.weight;
      }
    }

    if (itemWeight === null && product?.weight) {
      // Use product-level weight
      const w = product.weight;
      itemWeight = typeof w === 'object' && 'toNumber' in w ? w.toNumber() : Number(w);
      if (!Number.isFinite(itemWeight)) itemWeight = null;
    }

    total += (itemWeight ?? DEFAULT_WEIGHT_KG) * item.quantity;
  }

  return total;
}

export type PacketaResult = { id: string; barcode: string; barcodeText: string };

type PacketaCreatePacketResponse = {
  response?: {
    status?: string;
    string?: string;
    message?: string;
    detail?: {
      attributes?: {
        fault?: {
          name?: string;
          fault?: string;
        } | Array<{
          name?: string;
          fault?: string;
        }>;
      };
    };
    result?: {
      id?: string;
      barcode?: string;
      barcodeText?: string;
    };
  };
};

function formatPacketaFault(result: PacketaCreatePacketResponse) {
  const response = result?.response;
  const attributeFaultsRaw = response?.detail?.attributes?.fault;
  const attributeFaults = Array.isArray(attributeFaultsRaw)
    ? attributeFaultsRaw
    : attributeFaultsRaw
      ? [attributeFaultsRaw]
      : [];

  const attributeMessage = attributeFaults
    .map((fault) => {
      const name = fault?.name ? String(fault.name) : 'unknown';
      const detail = fault?.fault ? String(fault.fault) : '';
      return detail ? `${name}: ${detail}` : name;
    })
    .filter(Boolean)
    .join(' | ');

  return [response?.string, response?.message, attributeMessage]
    .filter(Boolean)
    .join(' | ') || `Packeta status: ${response?.status}`;
}

export async function createPacketaPacketForOrder(orderId: string, opts?: { force?: boolean }): Promise<PacketaResult> {
  const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
  if (!PACKETA_API_PASSWORD) throw new Error('Missing PACKETA_API_SECRET');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true, meta: true },
  });
  if (!order) throw new Error('Order not found');

  const existingPacketId = order.meta.find(m => m.key === '_packeta_packet_id')?.value || null;
  if (existingPacketId && !opts?.force) {
    const barcode = order.meta.find(m => m.key === '_packeta_barcode')?.value || '';
    const barcodeText = order.meta.find(m => m.key === '_packeta_barcode_text')?.value || '';
    return { id: existingPacketId, barcode, barcodeText };
  }

  const billing = order.addresses.find(a => a.type === 'BILLING');
  const shipping = order.addresses.find(a => a.type === 'SHIPPING');
  if (!billing?.email) throw new Error('Missing billing email');
  if (!shipping) throw new Error('Missing shipping address');

  const packetAttributes: Record<string, string | undefined> = {
    number: String(order.orderNumber ?? order.id),
    name: shipping.firstName,
    surname: shipping.lastName,
    email: billing.email,
    phone: String(billing.phone || '').replace(/[^\d]/g, ''),
    value: String(order.total),
    currency: String(order.currency || 'EUR'),
    weight: String(await calculateTotalWeight(order.items)),
    eshop_id: PACKETA_ESHOP_ID,
    cod: order.paymentMethod === 'cod' ? String(order.total) : undefined,
  };

  const isHomeDelivery = order.shippingMethod === 'packeta_home';
  if (isHomeDelivery) {
    let addressLine = shipping.address1;
    let parsed = parseAddress(addressLine);
    if (!parsed.street && shipping.address2) {
      addressLine = shipping.address2;
      parsed = parseAddress(addressLine);
    }
    if (!parsed.street) throw new Error(`Invalid address for home delivery: ${addressLine}`);

    const countryCode = String(shipping.country || 'SK').toUpperCase();
    const carrierId = PACKETA_HOME_CARRIER_IDS[countryCode] || PACKETA_HOME_CARRIER_IDS['SK'];

    Object.assign(packetAttributes, {
      addressId: carrierId,
      street: parsed.street,
      houseNumber: parsed.houseNumber,
      city: shipping.city,
      zip: String(shipping.postcode || '').replace(/\s/g, ''),
      country: countryCode.toLowerCase(),
    });
  } else {
    const pointId = order.packetaPointId || order.meta.find(m => m.key === '_packeta_point_id')?.value;
    if (!pointId) throw new Error('Missing Packeta point id');
    Object.assign(packetAttributes, { addressId: String(pointId) });
  }

  const xmlData = { createPacket: { apiPassword: PACKETA_API_PASSWORD, packetAttributes } };
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
  const result = await parser.parseStringPromise(respText) as PacketaCreatePacketResponse;
  if (result?.response?.status !== 'ok') {
    throw new Error(formatPacketaFault(result));
  }
  const r = result.response.result;
  if (!r?.id || !r?.barcode || !r?.barcodeText) throw new Error('Packeta response missing result fields');

  // Store packet meta (replace existing)
  await prisma.orderMeta.deleteMany({
    where: {
      orderId,
      key: { in: ['_packeta_packet_id', '_packeta_barcode', '_packeta_barcode_text'] },
    },
  });
  await prisma.orderMeta.createMany({
    data: [
      { orderId, key: '_packeta_packet_id', value: String(r.id) },
      { orderId, key: '_packeta_barcode', value: String(r.barcode) },
      { orderId, key: '_packeta_barcode_text', value: String(r.barcodeText) },
    ],
  });

  return { id: String(r.id), barcode: String(r.barcode), barcodeText: String(r.barcodeText) };
}
