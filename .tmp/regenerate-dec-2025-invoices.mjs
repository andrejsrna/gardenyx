// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
var buildConnectionString = () => {
  const base = process.env.POSTGRES_URL_PRISMA || process.env.POSTGRES_URL;
  if (!base) {
    throw new Error("POSTGRES_URL is required for Prisma");
  }
  const schema2 = process.env.PRISMA_DB_SCHEMA || "nkv_admin";
  const hasSchemaParam = base.includes("schema=");
  if (hasSchemaParam || process.env.POSTGRES_URL_PRISMA) {
    return { connectionString: base, schema: schema2 };
  }
  const separator = base.includes("?") ? "&" : "?";
  return { connectionString: `${base}${separator}schema=${schema2}`, schema: schema2 };
};
var { connectionString, schema } = buildConnectionString();
var pool = new Pool({
  connectionString,
  options: `-c search_path=${schema}`
});
var adapter = new PrismaPg(pool, { schema });
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
var prisma_default = prisma;

// app/lib/invoice/create-invoice.tsx
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document, Font, Page, StyleSheet, Text, View, renderToStream } from "@react-pdf/renderer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
var R2_BUCKET = process.env.R2_BUCKET;
var R2_DOMAIN = process.env.R2_DOMAIN;
var R2_API = process.env.R2_API;
var R2_ENDPOINT = process.env.R2_ENDPOINT;
var R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
var R2_SECRET_KEY = process.env.R2_SECRET_KEY;
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var resolveFontPath = () => {
  const localPath = path.join(__dirname, "DejaVuSans.ttf");
  if (fs.existsSync(localPath)) return localPath;
  return path.join(process.cwd(), "app", "lib", "invoice", "DejaVuSans.ttf");
};
var MIN_INVOICE_DATE = process.env.INVOICE_MIN_DATE ? new Date(process.env.INVOICE_MIN_DATE) : null;
var hasR2Config = Boolean(R2_BUCKET && R2_ENDPOINT && R2_ACCESS_KEY && R2_SECRET_KEY);
Font.register({
  family: "DejaVuSans",
  fonts: [
    {
      src: resolveFontPath()
    }
  ]
});
var accentColor = "#16a34a";
var borderColor = "#d1d5db";
var styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "DejaVuSans",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#0f172a",
    backgroundColor: "#f8fafc"
  },
  hero: {
    marginBottom: 20
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  badge: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: accentColor
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 2
  },
  subtitle: {
    fontSize: 14,
    color: "#475569"
  },
  section: {
    marginBottom: 16
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 }
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap"
  },
  detailCard: {
    flex: 1,
    minWidth: 220,
    marginBottom: 12
  },
  detailTitle: {
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 4
  },
  detailTitleRow: {
    fontSize: 9,
    color: "#475569",
    marginRight: 6
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right"
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: `1pt solid ${borderColor}`,
    paddingBottom: 8,
    marginBottom: 6
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottom: `1pt dashed ${borderColor}`
  },
  cell: {
    flex: 2
  },
  cellQty: {
    flex: 1,
    textAlign: "center"
  },
  cellDph: {
    flex: 1,
    textAlign: "right"
  },
  cellPrice: {
    flex: 1,
    textAlign: "right"
  },
  totals: {
    marginTop: 12,
    flexDirection: "column",
    alignItems: "flex-end"
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
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
    color: "#475569",
    textAlign: "center"
  }
});
var COMPANY_INFO = [
  "Najsilnej\u0161ia k\u013Abov\xE1 v\xFD\u017Eiva",
  "Enhold s.r.o.",
  "Drobn\xE9ho 1900/2",
  "84102 Bratislava \u2013 D\xFAbravka",
  "I\u010CO: 55400817",
  "DI\u010C: 2121985954",
  "I\u010CDPH: SK2121985954"
];
var toNumber = (value) => {
  if (value === void 0 || value === null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value.toNumber === "function") {
    return value.toNumber() ?? 0;
  }
  if (typeof value.toString === "function") {
    const parsed = Number(value.toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};
var currencyFormatter = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
var formatCurrency = (value) => `${currencyFormatter.format(value)} \u20AC`;
var formatDate = (date) => date.toLocaleDateString("sk-SK", { day: "numeric", month: "long", year: "numeric" });
var addressToLines = (address) => {
  if (!address) return [];
  return [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.company,
    address.address1,
    address.address2,
    [address.postcode, address.city].filter(Boolean).join(" "),
    address.country
  ].filter(Boolean);
};
var PAYMENT_LABELS = {
  cod: "Dobierka",
  stripe: "Platba kartou",
  bank_transfer: "Bankov\xFD prevod",
  other: "In\xE1 platobn\xE1 met\xF3da"
};
var SHIPPING_LABELS = {
  packeta_pickup: "Packeta - V\xFDdajn\xE9 miesto",
  packeta_home: "Packeta - Doru\u010Denie domov"
};
var getPaymentLabel = (method) => method ? PAYMENT_LABELS[method] : "\u2014";
var getShippingLabel = (method) => method ? SHIPPING_LABELS[method] ?? method : "\u2014";
var computeVatRate = (net, tax) => {
  if (net <= 0) return 0;
  return tax / net * 100;
};
var InvoiceDocument = ({
  order,
  invoiceNumber,
  issueDate,
  orderDate
}) => {
  const billing = order.addresses.find((a) => a.type === "BILLING");
  const subtotal = toNumber(order.subtotal);
  const shippingTotal = toNumber(order.shippingTotal);
  const taxTotal = toNumber(order.taxTotal);
  const discountTotal = toNumber(order.discountTotal);
  const grandTotal = toNumber(order.total);
  const netSum = Math.max(0, grandTotal - taxTotal);
  const vatPercent = computeVatRate(netSum, taxTotal);
  const paymentLabel = getPaymentLabel(order.paymentMethod);
  const shippingLabel = getShippingLabel(order.shippingMethod);
  const vatShare = grandTotal > 0 ? taxTotal / grandTotal : 0;
  return /* @__PURE__ */ React.createElement(Document, null, /* @__PURE__ */ React.createElement(Page, { size: "A4", style: styles.page }, /* @__PURE__ */ React.createElement(View, { style: styles.hero }, /* @__PURE__ */ React.createElement(View, { style: styles.heroRow }, /* @__PURE__ */ React.createElement(View, null, /* @__PURE__ */ React.createElement(Text, { style: styles.badge }, "FAKT\xDARA"), /* @__PURE__ */ React.createElement(Text, { style: styles.title }, "Da\u0148ov\xFD doklad")), /* @__PURE__ */ React.createElement(Text, { style: styles.subtitle }, "Najsilnej\u0161ia k\u013Abov\xE1 v\xFD\u017Eiva / Enhold s.r.o."))), /* @__PURE__ */ React.createElement(View, { style: styles.card }, /* @__PURE__ */ React.createElement(View, { style: styles.row }, /* @__PURE__ */ React.createElement(View, { style: styles.detailCard }, /* @__PURE__ */ React.createElement(Text, { style: styles.detailTitle }, "Dod\xE1vate\u013E"), COMPANY_INFO.map((line) => /* @__PURE__ */ React.createElement(Text, { key: `company-${line}` }, line))), /* @__PURE__ */ React.createElement(View, { style: styles.detailCard }, /* @__PURE__ */ React.createElement(Text, { style: styles.detailTitle }, "Z\xE1kazn\xEDk"), addressToLines(billing).map((line) => /* @__PURE__ */ React.createElement(Text, { key: `customer-${line}` }, line))))), /* @__PURE__ */ React.createElement(View, { style: styles.card }, [
    { title: "\u010C\xEDslo fakt\xFAry", value: invoiceNumber },
    { title: "D\xE1tum vystavenia", value: formatDate(issueDate) },
    { title: "\u010C\xEDslo objedn\xE1vky", value: order.orderNumber.toString() },
    { title: "D\xE1tum objedn\xE1vky", value: formatDate(orderDate) },
    { title: "Sp\xF4sob platby", value: paymentLabel },
    { title: "Doru\u010Denie", value: shippingLabel }
  ].map((item) => /* @__PURE__ */ React.createElement(View, { key: item.title, style: styles.infoLine }, /* @__PURE__ */ React.createElement(Text, { style: styles.detailTitleRow }, item.title), /* @__PURE__ */ React.createElement(Text, { style: styles.infoValue }, item.value)))), /* @__PURE__ */ React.createElement(View, { style: styles.card }, /* @__PURE__ */ React.createElement(View, { style: styles.tableHeader }, /* @__PURE__ */ React.createElement(Text, { style: styles.cell }, "Produkt"), /* @__PURE__ */ React.createElement(Text, { style: styles.cellQty }, "Mno\u017E."), /* @__PURE__ */ React.createElement(Text, { style: styles.cellDph }, "DPH"), /* @__PURE__ */ React.createElement(Text, { style: styles.cellPrice }, "Cena s DPH")), order.items.map((item) => {
    const total = toNumber(item.total);
    const itemTax = total * vatShare;
    return /* @__PURE__ */ React.createElement(View, { key: item.id, style: styles.tableRow }, /* @__PURE__ */ React.createElement(Text, { style: styles.cell }, item.productName), /* @__PURE__ */ React.createElement(Text, { style: styles.cellQty }, item.quantity), /* @__PURE__ */ React.createElement(Text, { style: styles.cellDph }, formatCurrency(itemTax)), /* @__PURE__ */ React.createElement(Text, { style: styles.cellPrice }, formatCurrency(total)));
  }), /* @__PURE__ */ React.createElement(View, { style: styles.divider }), /* @__PURE__ */ React.createElement(View, { style: styles.totals }, /* @__PURE__ */ React.createElement(View, { style: styles.totalsRow }, /* @__PURE__ */ React.createElement(Text, null, "Medzis\xFA\u010Det"), /* @__PURE__ */ React.createElement(Text, null, formatCurrency(subtotal))), /* @__PURE__ */ React.createElement(View, { style: styles.totalsRow }, /* @__PURE__ */ React.createElement(Text, null, "Doprava"), /* @__PURE__ */ React.createElement(Text, null, formatCurrency(shippingTotal))), /* @__PURE__ */ React.createElement(View, { style: styles.totalsRow }, /* @__PURE__ */ React.createElement(Text, null, "DPH (", vatPercent.toFixed(0), "%)"), /* @__PURE__ */ React.createElement(Text, null, formatCurrency(taxTotal))), /* @__PURE__ */ React.createElement(View, { style: styles.totalsRow }, /* @__PURE__ */ React.createElement(Text, null, "Z\u013Eava"), /* @__PURE__ */ React.createElement(Text, null, formatCurrency(discountTotal))), /* @__PURE__ */ React.createElement(View, { style: styles.totalsRow }, /* @__PURE__ */ React.createElement(Text, { style: styles.detailTitle }, "Cena spolu"), /* @__PURE__ */ React.createElement(Text, { style: styles.detailTitle }, formatCurrency(grandTotal))))), /* @__PURE__ */ React.createElement(Text, { style: styles.footer }, "\u010Eakujeme za v\xE1\u0161 n\xE1kup. V pr\xEDpade ot\xE1zok kontaktujte info@fitdoplnky.sk.")));
};
var renderInvoicePdf = async (order, invoiceNumber, issueDate, orderDate) => {
  const stream = await renderToStream(
    /* @__PURE__ */ React.createElement(InvoiceDocument, { order, invoiceNumber, issueDate, orderDate })
  );
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};
var buildR2Client = () => {
  if (!hasR2Config) return null;
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY
    }
  });
};
var buildR2Url = (key) => {
  const trimmedKey = key.startsWith("/") ? key.slice(1) : key;
  if (R2_DOMAIN) {
    const prefix = R2_DOMAIN.endsWith("/") ? R2_DOMAIN.slice(0, -1) : R2_DOMAIN;
    return `${prefix}/${trimmedKey}`;
  }
  if (R2_API) {
    const prefix = R2_API.endsWith("/") ? R2_API.slice(0, -1) : R2_API;
    return `${prefix}/${trimmedKey}`;
  }
  return `${R2_ENDPOINT?.replace(/\/$/, "")}/${trimmedKey}`;
};
var uploadPdfToR2 = async (key, buffer) => {
  if (!hasR2Config) {
    throw new Error("Missing R2 configuration for invoice upload.");
  }
  if (!R2_BUCKET) {
    throw new Error("Missing R2 bucket name.");
  }
  const client = buildR2Client();
  if (!client) {
    throw new Error("Unable to create R2 client.");
  }
  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf"
  }));
  return buildR2Url(key);
};
async function createInvoiceForOrder(order, options) {
  if (!hasR2Config) {
    console.warn("[invoice] R2 configuration missing \u2014 skipping invoice generation");
    return null;
  }
  if (MIN_INVOICE_DATE && new Date(order.createdAt) < MIN_INVOICE_DATE && !options?.force) {
    console.warn(`[invoice] skipping invoice for order ${order.id} created before ${MIN_INVOICE_DATE.toISOString()}`);
    return null;
  }
  if (!options?.force && order.meta.some((m) => m.key === "_invoice_created_at")) {
    return null;
  }
  const invoiceNumber = `NKV${order.orderNumber || order.id}`;
  const issueDate = /* @__PURE__ */ new Date();
  const orderDate = new Date(order.createdAt);
  const buffer = await renderInvoicePdf(order, invoiceNumber, issueDate, orderDate);
  const filename = `invoices/invoice-${invoiceNumber}-${Date.now()}.pdf`;
  const invoiceUrl = await uploadPdfToR2(filename, buffer);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const metaEntries = [
    { orderId: order.id, key: "_invoice_created_at", value: now },
    { orderId: order.id, key: "_invoice_url", value: invoiceUrl },
    { orderId: order.id, key: "_invoice_filename", value: filename },
    { orderId: order.id, key: "_invoice_number", value: invoiceNumber }
  ];
  await prisma_default.orderMeta.createMany({ data: metaEntries, skipDuplicates: true });
  return { url: invoiceUrl, invoiceNumber };
}

// scripts/regenerate-dec-2025-invoices.ts
var START = /* @__PURE__ */ new Date("2025-12-01T00:00:00.000Z");
var END = /* @__PURE__ */ new Date("2026-01-01T00:00:00.000Z");
var INVOICE_META_KEYS = ["_invoice_created_at", "_invoice_url", "_invoice_filename", "_invoice_number"];
async function main() {
  const orders = await prisma_default.order.findMany({
    where: {
      createdAt: { gte: START, lt: END },
      meta: { some: { key: "_packeta_status_code", value: "7" } }
    },
    include: { items: true, addresses: true, meta: true }
  });
  console.log(`[invoices] Found ${orders.length} orders for Dec 2025 with Packeta status delivered`);
  for (const order of orders) {
    console.log(`[invoices] Regenerating for order ${order.id} (${order.orderNumber})`);
    await prisma_default.orderMeta.deleteMany({
      where: { orderId: order.id, key: { in: INVOICE_META_KEYS } }
    });
    const result = await createInvoiceForOrder(order, { force: true });
    if (result) {
      console.log(`  \u2713 Generated ${result.invoiceNumber} -> ${result.url}`);
    } else {
      console.warn("  \u26A0\uFE0F Skipped (no R2 config or other guard)");
    }
  }
}
main().catch((err) => {
  console.error("[invoices] Failed", err);
  process.exit(1);
}).finally(async () => {
  await prisma_default.$disconnect();
});
