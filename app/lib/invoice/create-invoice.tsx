import { OrderAddress, PaymentMethod, Prisma } from '@prisma/client';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prisma from '../prisma';
import { Document, Font, Page, StyleSheet, Text, View, renderToStream } from '@react-pdf/renderer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PRODUCT_VAT_PERCENT, SHIPPING_VAT_PERCENT } from '@/app/lib/pricing/constants';

const R2_BUCKET = process.env.R2_BUCKET;
const R2_DOMAIN = process.env.R2_DOMAIN;
const R2_API = process.env.R2_API;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolveFontPath = () => {
  const localPath = path.join(__dirname, 'DejaVuSans.ttf');
  if (fs.existsSync(localPath)) return localPath;
  return path.join(process.cwd(), 'app', 'lib', 'invoice', 'DejaVuSans.ttf');
};

const MIN_INVOICE_DATE = process.env.INVOICE_MIN_DATE ? new Date(process.env.INVOICE_MIN_DATE) : null;
const hasR2Config = Boolean(R2_BUCKET && R2_ENDPOINT && R2_ACCESS_KEY && R2_SECRET_KEY);
const INVOICE_META_KEYS = ['_invoice_created_at', '_invoice_url', '_invoice_filename', '_invoice_number'] as const;

Font.register({
  family: 'DejaVuSans',
  fonts: [
    {
      src: resolveFontPath()
    }
  ]
});

const accentColor = '#16a34a';
const borderColor = '#d1d5db';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'DejaVuSans',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#0f172a',
    backgroundColor: '#f8fafc'
  },
  hero: {
    marginBottom: 20
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between'
  },
  badge: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: accentColor
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 14,
    color: '#475569'
  },
  section: {
    marginBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 }
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  detailCard: {
    flex: 1,
    minWidth: 220,
    marginBottom: 12
  },
  detailTitle: {
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4
  },
  detailTitleRow: {
    fontSize: 9,
    color: '#475569',
    marginRight: 6
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right'
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: `1pt solid ${borderColor}`,
    paddingBottom: 8,
    marginBottom: 6
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: `1pt dashed ${borderColor}`
  },
  cell: {
    flex: 2
  },
  cellQty: {
    flex: 1,
    textAlign: 'center'
  },
  cellNet: {
    flex: 1,
    textAlign: 'right'
  },
  cellDph: {
    flex: 1,
    textAlign: 'right'
  },
  cellPrice: {
    flex: 1,
    textAlign: 'right'
  },
  totals: {
    marginTop: 12,
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 4
  },
  divider: {
    height: 1,
    backgroundColor: borderColor,
    marginVertical: 8
  },
  accent: {
    color: accentColor
  },
  footer: {
    marginTop: 24,
    fontSize: 9,
    color: '#475569',
    textAlign: 'center'
  }
});

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; addresses: true; meta: true } }>;

const COMPANY_INFO = [
  'GardenYX',
  'JOINA Garden, s. r. o.',
  'Karpatské námestie 7770/10A',
  '831 06 Bratislava – mestská časť Rača',
  'IČO: 57 313 504',
  'E-mail: support@gardenyx.eu'
];

const toNumber = (value: string | number | Prisma.Decimal | undefined | null) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber() ?? 0;
  }
  if (typeof (value as { toString?: () => string }).toString === 'function') {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const currencyFormatter = new Intl.NumberFormat('sk-SK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatCurrency = (value: number) => `${currencyFormatter.format(value)} €`;

const formatDate = (date: Date) => date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });

const addressToLines = (address?: OrderAddress) => {
  if (!address) return [];
  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.company,
    address.address1,
    address.address2,
    [address.postcode, address.city].filter(Boolean).join(' '),
    address.country
  ].filter(Boolean);
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Dobierka',
  stripe: 'Platba kartou',
  bank_transfer: 'Bankový prevod',
  other: 'Iná platobná metóda'
};

const SHIPPING_LABELS: Record<string, string> = {
  packeta_pickup: 'Packeta - Výdajné miesto',
  packeta_home: 'Packeta - Doručenie domov'
};

const getPaymentLabel = (method?: PaymentMethod) => (method ? PAYMENT_LABELS[method] : '—');

const getShippingLabel = (method?: string | null) => (method ? SHIPPING_LABELS[method] ?? method : '—');

const InvoiceDocument = ({
  order,
  invoiceNumber,
  issueDate,
  orderDate
}: {
  order: OrderWithRelations;
  invoiceNumber: string;
  issueDate: Date;
  orderDate: Date;
}) => {
  const billing = order.addresses.find(a => a.type === 'BILLING');
  const productVatRate = PRODUCT_VAT_PERCENT / 100;
  const shippingVatRate = SHIPPING_VAT_PERCENT / 100;
  const productVatFactor = productVatRate / (1 + productVatRate); // share of VAT in gross
  const shippingVatFactor = shippingVatRate / (1 + shippingVatRate); // share of VAT in gross
  const discountTotal = toNumber(order.discountTotal);
  const shippingTotal = toNumber(order.shippingTotal);
  const grossTotal = Math.max(0, toNumber(order.total)); // should already include DPH
  const itemsBaseSum = order.items.reduce((sum, item) => sum + toNumber(item.total), 0) || 0;
  const itemsGrossPool = Math.max(0, grossTotal - shippingTotal);
  const lineFactor = itemsBaseSum > 0 ? itemsGrossPool / itemsBaseSum : 0;
  const itemRows = order.items.map(item => {
    const weightedGross = toNumber(item.total) * lineFactor; // distribute gross so rows sum to total
    const itemTax = weightedGross * productVatFactor;
    const itemNet = weightedGross - itemTax;
    return { item, weightedGross, itemTax, itemNet };
  });
  const itemsTaxTotal = itemRows.reduce((sum, row) => sum + row.itemTax, 0);
  const shippingTax = shippingTotal * shippingVatFactor;
  const taxTotal = Math.max(0, itemsTaxTotal + shippingTax);
  const netSum = Math.max(0, grossTotal - taxTotal); // cena bez DPH (vrátane dopravy a zľavy)
  const paymentLabel = getPaymentLabel(order.paymentMethod as PaymentMethod);
  const shippingLabel = getShippingLabel(order.shippingMethod);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.badge}>FAKTÚRA</Text>
              <Text style={styles.title}>Daňový doklad</Text>
            </View>
            <Text style={styles.subtitle}>GardenYX / JOINA Garden, s. r. o.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Dodávateľ</Text>
              {COMPANY_INFO.map(line => (
                <Text key={`company-${line}`}>{line}</Text>
              ))}
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Zákazník</Text>
              {addressToLines(billing).map(line => (
                <Text key={`customer-${line}`}>{line}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          {[
            { title: 'Číslo faktúry', value: invoiceNumber },
            { title: 'Dátum vystavenia', value: formatDate(issueDate) },
            { title: 'Číslo objednávky', value: order.orderNumber.toString() },
            { title: 'Dátum objednávky', value: formatDate(orderDate) },
            { title: 'Spôsob platby', value: paymentLabel },
            { title: 'Doručenie', value: shippingLabel }
          ].map(item => (
            <View key={item.title} style={styles.infoLine}>
              <Text style={styles.detailTitleRow}>{item.title}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>Produkt</Text>
            <Text style={styles.cellQty}>Množ.</Text>
            <Text style={styles.cellNet}>Cena bez DPH</Text>
            <Text style={styles.cellDph}>DPH</Text>
            <Text style={styles.cellPrice}>Cena s DPH</Text>
          </View>
          {itemRows.map(({ item, weightedGross, itemTax, itemNet }) => {
            return (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cell}>{item.productName}</Text>
                <Text style={styles.cellQty}>{item.quantity}</Text>
                <Text style={styles.cellNet}>{formatCurrency(itemNet)}</Text>
                <Text style={styles.cellDph}>{formatCurrency(itemTax)}</Text>
                <Text style={styles.cellPrice}>{formatCurrency(weightedGross)}</Text>
              </View>
            );
          })}
          {shippingTotal > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>Doprava (DPH {SHIPPING_VAT_PERCENT}%)</Text>
              <Text style={styles.cellQty}>—</Text>
              <Text style={styles.cellNet}>{formatCurrency(shippingTotal - shippingTax)}</Text>
              <Text style={styles.cellDph}>{formatCurrency(shippingTax)}</Text>
              <Text style={styles.cellPrice}>{formatCurrency(shippingTotal)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totals}>
            <View style={styles.totalsRow}>
              <Text>Medzisúčet (bez DPH)</Text>
              <Text>{formatCurrency(netSum)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>DPH ({PRODUCT_VAT_PERCENT}%)</Text>
              <Text>{formatCurrency(itemsTaxTotal)}</Text>
            </View>
            {shippingTotal > 0 && (
              <View style={styles.totalsRow}>
                <Text>DPH ({SHIPPING_VAT_PERCENT}%)</Text>
                <Text>{formatCurrency(shippingTax)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text>Zľava</Text>
              <Text>{formatCurrency(discountTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.detailTitle}>Cena spolu</Text>
              <Text style={styles.detailTitle}>{formatCurrency(grossTotal)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Ďakujeme za váš nákup. V prípade otázok kontaktujte support@gardenyx.eu.</Text>
      </Page>
    </Document>
  );
};

const renderInvoicePdf = async (order: OrderWithRelations, invoiceNumber: string, issueDate: Date, orderDate: Date) => {
  const stream = await renderToStream(
    <InvoiceDocument order={order} invoiceNumber={invoiceNumber} issueDate={issueDate} orderDate={orderDate} />
  );
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};
const buildR2Client = () => {
  if (!hasR2Config) return null;
  return new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY as string,
      secretAccessKey: R2_SECRET_KEY as string
    }
  });
};

const buildR2Url = (key: string) => {
  const trimmedKey = key.startsWith('/') ? key.slice(1) : key;
  if (R2_DOMAIN) {
    const prefix = R2_DOMAIN.endsWith('/') ? R2_DOMAIN.slice(0, -1) : R2_DOMAIN;
    return `${prefix}/${trimmedKey}`;
  }
  if (R2_API) {
    const prefix = R2_API.endsWith('/') ? R2_API.slice(0, -1) : R2_API;
    return `${prefix}/${trimmedKey}`;
  }
  return `${R2_ENDPOINT?.replace(/\/$/, '')}/${trimmedKey}`;
};

const uploadPdfToR2 = async (key: string, buffer: Buffer) => {
  if (!hasR2Config) {
    throw new Error('Missing R2 configuration for invoice upload.');
  }
  if (!R2_BUCKET) {
    throw new Error('Missing R2 bucket name.');
  }
  const client = buildR2Client();
  if (!client) {
    throw new Error('Unable to create R2 client.');
  }
  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf'
  }));
  return buildR2Url(key);
};

export type InvoiceCreationResult = {
  url: string;
  invoiceNumber: string;
};

export async function createInvoiceForOrder(
  order: OrderWithRelations,
  options?: { force?: boolean }
): Promise<InvoiceCreationResult | null> {
  if (!hasR2Config) {
    console.warn('[invoice] R2 configuration missing — skipping invoice generation');
    return null;
  }
  if (MIN_INVOICE_DATE && new Date(order.createdAt) < MIN_INVOICE_DATE && !options?.force) {
    console.warn(`[invoice] skipping invoice for order ${order.id} created before ${MIN_INVOICE_DATE.toISOString()}`);
    return null;
  }
  if (!options?.force && order.meta.some(m => m.key === '_invoice_created_at')) {
    return null;
  }

  const invoiceNumber = `GYX${order.orderNumber || order.id}`;
  const issueDate = new Date();
  const orderDate = new Date(order.createdAt);
  const buffer = await renderInvoicePdf(order, invoiceNumber, issueDate, orderDate);
  const filename = `invoices/invoice-${invoiceNumber}-${Date.now()}.pdf`;
  const invoiceUrl = await uploadPdfToR2(filename, buffer);

  const now = new Date().toISOString();
  const metaEntries: Array<Prisma.OrderMetaCreateManyInput> = [
    { orderId: order.id, key: '_invoice_created_at', value: now },
    { orderId: order.id, key: '_invoice_url', value: invoiceUrl },
    { orderId: order.id, key: '_invoice_filename', value: filename },
    { orderId: order.id, key: '_invoice_number', value: invoiceNumber }
  ];

  if (options?.force) {
    await prisma.$transaction(async tx => {
      await tx.orderMeta.deleteMany({
        where: { orderId: order.id, key: { in: [...INVOICE_META_KEYS] } }
      });
      await tx.orderMeta.createMany({ data: metaEntries });
    });
  } else {
    await prisma.orderMeta.createMany({ data: metaEntries, skipDuplicates: true });
  }

  return { url: invoiceUrl, invoiceNumber };
}
