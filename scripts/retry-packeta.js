/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const { Builder, Parser } = require('xml2js');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_CARRIER_ID = '131';

function parseEnvLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const eq = trimmed.indexOf('=');
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function loadEnvFiles(cwd = process.cwd()) {
  for (const filename of ['.env.local', '.env']) {
    const fullPath = path.join(cwd, filename);
    if (!fs.existsSync(fullPath)) continue;
    const contents = fs.readFileSync(fullPath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (process.env[parsed.key] === undefined) process.env[parsed.key] = parsed.value;
    }
  }
}

function buildConnectionString() {
  const base = process.env.POSTGRES_URL_PRISMA || process.env.POSTGRES_URL;
  if (!base) throw new Error('POSTGRES_URL is required for Prisma');

  const schema = process.env.PRISMA_DB_SCHEMA || 'nkv_admin';
  const hasSchemaParam = base.includes('schema=');
  if (hasSchemaParam || process.env.POSTGRES_URL_PRISMA) {
    return { connectionString: base, schema };
  }
  const separator = base.includes('?') ? '&' : '?';
  return { connectionString: `${base}${separator}schema=${schema}`, schema };
}

function createPrisma() {
  const { connectionString, schema } = buildConnectionString();
  const pool = new Pool({ connectionString, options: `-c search_path=${schema}` });
  const adapter = new PrismaPg(pool, { schema });
  return new PrismaClient({ adapter, log: ['error'] });
}

function parseAddress(addressLine) {
  if (!addressLine) return { street: '', houseNumber: '' };
  const match = String(addressLine).match(/^(.*?)\s*([\d/A-Za-z-]+)$/);
  if (match && match[2] && /\d/.test(match[2])) {
    return { street: (match[1] || '').trim(), houseNumber: String(match[2]).trim() };
  }
  return { street: String(addressLine).trim(), houseNumber: '' };
}

function calculateTotalWeight(lineItems) {
  return (lineItems || []).reduce((total, item) => total + (Number(item.quantity) || 0) * 0.5, 0);
}

async function retryPacketa(prisma, orderId) {
  const force = process.argv.includes('--force');
  const apiPassword = process.env.PACKETA_API_SECRET;
  if (!apiPassword) throw new Error('Missing PACKETA_API_SECRET (set it in .env/.env.local)');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true, meta: true },
  });
  if (!order) throw new Error(`Order not found: ${orderId}`);

  const existingPacketId = (order.meta.find(m => m.key === '_packeta_packet_id') || {}).value || null;
  if (existingPacketId && !force) {
    throw new Error(`Order already has Packeta packet (${existingPacketId}); re-run with --force to create a new one.`);
  }

  const shippingMethod = order.shippingMethod || '';
  if (shippingMethod !== 'packeta_pickup' && shippingMethod !== 'packeta_home') {
    throw new Error(`Order shippingMethod is not Packeta: ${shippingMethod || '—'}`);
  }

  const billing = order.addresses.find(a => a.type === 'BILLING');
  const shipping = order.addresses.find(a => a.type === 'SHIPPING') || billing;
  if (!billing || !shipping) throw new Error('Missing billing/shipping address on order');

  const isHomeDelivery = shippingMethod === 'packeta_home';
  const packetaPointId =
    order.packetaPointId ||
    (order.meta.find(m => m.key === '_packeta_point_id') || {}).value ||
    null;
  if (!isHomeDelivery && !packetaPointId) {
    throw new Error('Missing Packeta pickup point id (packetaPointId/_packeta_point_id)');
  }

  const lineItems = order.items.map(item => ({
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const packetAttributes = {
    number: String(order.orderNumber),
    name: shipping.firstName,
    surname: shipping.lastName,
    email: billing.email || '',
    phone: String(billing.phone || '').replace(/[^\d]/g, ''),
    value: order.total.toString(),
    currency: order.currency,
    weight: String(calculateTotalWeight(lineItems)),
    eshop: 'FITDOPLNKY',
    cod: order.paymentMethod === 'cod' ? order.total.toString() : undefined,
  };

  if (isHomeDelivery) {
    let addressLine = shipping.address1;
    let parsedAddress = parseAddress(addressLine);
    if (!parsedAddress.street && shipping.address2) {
      addressLine = shipping.address2;
      parsedAddress = parseAddress(addressLine);
    }
    const { street, houseNumber } = parsedAddress;
    if (!street) {
      throw new Error(`Invalid address format for home delivery (missing street): ${addressLine || '—'}`);
    }
    Object.assign(packetAttributes, {
      addressId: PACKETA_CARRIER_ID,
      street,
      houseNumber,
      city: shipping.city,
      zip: String(shipping.postcode || '').replace(/\s/g, ''),
    });
  } else {
    Object.assign(packetAttributes, { addressId: packetaPointId });
  }

  const builder = new Builder({
    renderOpts: { pretty: true, indent: '  ' },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  });
  const xmlRequest = builder.buildObject({
    createPacket: { apiPassword, packetAttributes },
  });

  const resp = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', Accept: 'application/xml' },
    body: xmlRequest,
  });
  const responseText = await resp.text();
  if (!resp.ok) {
    throw new Error(`Packeta createPacket failed: ${resp.status} ${resp.statusText}`);
  }

  const parser = new Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(responseText);
  if (!parsed || !parsed.response || parsed.response.status !== 'ok') {
    const status = parsed?.response?.status ? String(parsed.response.status) : 'unknown';
    const message = parsed?.response?.message ? String(parsed.response.message) : '';
    const responseDebug = parsed?.response ? JSON.stringify(parsed.response) : responseText.slice(0, 800);
    const extra = message ? `: ${message}` : '';
    throw new Error(`Packeta createPacket failed (status=${status})${extra}\nresponse=${responseDebug}`);
  }
  if (!parsed.response.result) throw new Error('Packeta response missing result');

  const packet = parsed.response.result;

  await prisma.$transaction([
    prisma.orderMeta.deleteMany({
      where: {
        orderId: order.id,
        key: { in: ['_packeta_packet_id', '_packeta_barcode', '_packeta_barcode_text'] },
      },
    }),
    prisma.orderMeta.createMany({
      data: [
        { orderId: order.id, key: '_packeta_packet_id', value: packet.id },
        { orderId: order.id, key: '_packeta_barcode', value: packet.barcode },
        { orderId: order.id, key: '_packeta_barcode_text', value: packet.barcodeText },
      ],
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'processing' } }),
  ]);

  return packet;
}

async function main() {
  loadEnvFiles();

  const orderId = process.argv[2];
  if (!orderId) {
    throw new Error('Usage: node scripts/retry-packeta.js <orderId>');
  }

  const prisma = createPrisma();
  try {
    const packet = await retryPacketa(prisma, orderId);
    console.log(
      JSON.stringify(
        { ok: true, orderId, packeta: { id: packet.id, barcode: packet.barcode, barcodeText: packet.barcodeText } },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
