import { Builder, Parser } from 'xml2js';
import prisma from '@/app/lib/prisma';

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
    weight: String(calculateTotalWeight(order.items)),
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

    Object.assign(packetAttributes, {
      addressId: PACKETA_CARRIER_ID,
      street: parsed.street,
      houseNumber: parsed.houseNumber,
      city: shipping.city,
      zip: String(shipping.postcode || '').replace(/\s/g, ''),
      country: String(shipping.country || 'SK'),
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
