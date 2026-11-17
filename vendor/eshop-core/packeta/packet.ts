import { packetaApiPassword, packetaCall } from './api';

export type PacketaResult = { id: string; barcode: string; barcodeText: string };

type Meta = { key: string; value: string | null };
type Address = {
  type: string;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  address1: string | null;
  address2?: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
};
export type PacketaOrderItem = { productId: bigint | number; variationId?: bigint | number | null; quantity: number };
type OrderRow = {
  id: string;
  orderNumber: number | bigint | string | null;
  total: unknown;
  currency: string | null;
  paymentMethod: string;
  shippingMethod: string | null;
  packetaPointId?: string | null;
  meta: Meta[];
  addresses: Address[];
  items: PacketaOrderItem[];
};

/** Subset of the Prisma client used here (pass `prisma`). */
export interface PacketaDb {
  order: {
    findUnique(args: { where: { id: string }; include: { items: true; addresses: true; meta: true } }): PromiseLike<OrderRow | null>;
  };
  orderMeta: {
    deleteMany(args: { where: { orderId: string; key: { in: string[] } } }): PromiseLike<unknown>;
    createMany(args: { data: Array<{ orderId: string; key: string; value: string }> }): PromiseLike<unknown>;
  };
}

export type PacketaShopConfig = {
  db: PacketaDb;
  /** Sender label (`eshop`), needed only when the Packeta account has several senders. */
  sender?: string;
  /** Case of the `country` attribute sent for home delivery (default upper). */
  homeCountryCase?: 'upper' | 'lower';
  /** Home-delivery carrier id by upper-case country code; the first entry is the fallback. */
  homeCarrierIds: Record<string, string>;
  /** Parcel weight in kg for the order items (shops know where weights live). */
  weightKg(items: PacketaOrderItem[]): Promise<number> | number;
};

const PACKET_META_KEYS = ['_packeta_packet_id', '_packeta_barcode', '_packeta_barcode_text'];

/** Splits "Hlavná 12/A" into street + house number (the number must contain a digit). */
export function parseAddress(addressLine: string | null | undefined): { street: string; houseNumber: string } {
  const line = (addressLine || '').trim();
  const match = line.match(/^(.*?)\s*([\d/A-Za-z-]+)$/);
  if (match?.[2] && /\d/.test(match[2])) return { street: (match[1] || '').trim(), houseNumber: match[2].trim() };
  return { street: line, houseNumber: '' };
}

/**
 * Creates the Packeta packet for an order (pickup point or home delivery, COD amount for `cod`)
 * and stores its id/barcode in order meta. Idempotent unless `force`.
 */
export async function createPacketaPacketForOrder(
  config: PacketaShopConfig,
  orderId: string,
  opts?: { force?: boolean },
): Promise<PacketaResult> {
  const apiPassword = packetaApiPassword();
  if (!apiPassword) throw new Error('Missing PACKETA_API_SECRET');

  const { db } = config;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, addresses: true, meta: true } });
  if (!order) throw new Error('Order not found');
  const meta = (key: string) => order.meta.find(m => m.key === key)?.value || '';

  if (meta('_packeta_packet_id') && !opts?.force) {
    return { id: meta('_packeta_packet_id'), barcode: meta('_packeta_barcode'), barcodeText: meta('_packeta_barcode_text') };
  }

  const billing = order.addresses.find(a => a.type === 'BILLING');
  const shipping = order.addresses.find(a => a.type === 'SHIPPING');
  if (!billing?.email) throw new Error('Missing billing email');
  if (!shipping) throw new Error('Missing shipping address');

  const total = String(order.total);
  const packetAttributes: Record<string, string | undefined> = {
    number: String(order.orderNumber ?? order.id),
    name: shipping.firstName ?? '',
    surname: shipping.lastName ?? '',
    email: billing.email,
    phone: String(billing.phone || '').replace(/[^\d]/g, ''),
    value: total,
    currency: order.currency || 'EUR',
    weight: String(await config.weightKg(order.items)),
    eshop: config.sender,
    cod: order.paymentMethod === 'cod' ? total : undefined,
  };

  if (order.shippingMethod === 'packeta_home') {
    let parsed = parseAddress(shipping.address1);
    if (!parsed.street && shipping.address2) parsed = parseAddress(shipping.address2);
    if (!parsed.street) throw new Error(`Invalid address for home delivery: ${shipping.address1}`);
    const country = String(shipping.country || 'SK').toUpperCase();
    Object.assign(packetAttributes, {
      addressId: config.homeCarrierIds[country] ?? Object.values(config.homeCarrierIds)[0],
      street: parsed.street,
      houseNumber: parsed.houseNumber,
      city: shipping.city ?? '',
      zip: String(shipping.postcode || '').replace(/\s/g, ''),
      country: config.homeCountryCase === 'lower' ? country.toLowerCase() : country,
    });
  } else {
    const pointId = order.packetaPointId || meta('_packeta_point_id');
    if (!pointId) throw new Error('Missing Packeta point id');
    packetAttributes.addressId = String(pointId);
  }

  const r = await packetaCall<{ id?: string; barcode?: string; barcodeText?: string }>('createPacket', {
    apiPassword,
    packetAttributes,
  });
  if (!r?.id || !r.barcode || !r.barcodeText) throw new Error('Packeta response missing result fields');

  await db.orderMeta.deleteMany({ where: { orderId, key: { in: PACKET_META_KEYS } } });
  await db.orderMeta.createMany({
    data: [
      { orderId, key: '_packeta_packet_id', value: String(r.id) },
      { orderId, key: '_packeta_barcode', value: String(r.barcode) },
      { orderId, key: '_packeta_barcode_text', value: String(r.barcodeText) },
    ],
  });
  return { id: String(r.id), barcode: String(r.barcode), barcodeText: String(r.barcodeText) };
}
