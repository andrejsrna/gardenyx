import 'dotenv/config';
import { Prisma } from '@prisma/client';
import prisma from '../app/lib/prisma';
import { createInvoiceForOrder, type OrderWithRelations } from '../app/lib/invoice/create-invoice';

type Args = {
  year: number | null;
  month: number | null;
  apply: boolean;
  packetaDeliveredOnly: boolean;
  fixTaxTotal: boolean;
  limit: number | null;
};

const parseArgs = (): Args => {
  const raw = process.argv.slice(2);
  const takeValue = (flag: string) => {
    const idx = raw.indexOf(flag);
    if (idx === -1) return null;
    const val = raw[idx + 1];
    if (!val || val.startsWith('--')) return null;
    return val;
  };

  const yearStr = takeValue('--year');
  const monthStr = takeValue('--month');
  const limitStr = takeValue('--limit');

  const year = yearStr ? Number(yearStr) : null;
  const month = monthStr ? Number(monthStr) : null;
  const limit = limitStr ? Number(limitStr) : null;

  return {
    year: Number.isInteger(year) ? year : null,
    month: Number.isInteger(month) ? month : null,
    apply: raw.includes('--apply'),
    packetaDeliveredOnly: raw.includes('--packeta-delivered'),
    fixTaxTotal: raw.includes('--fix-tax-total'),
    limit: Number.isInteger(limit) && (limit as number) > 0 ? (limit as number) : null
  };
};

const usageAndExit = (message?: string): never => {
  if (message) console.error(message);
  console.error(
    [
      'Usage:',
      '  node scripts/run-regenerate-invoices-month.js --year 2025 --month 12 [--apply] [--packeta-delivered] [--fix-tax-total] [--limit 100]',
      '',
      'Notes:',
      '  - default is DRY-RUN (no DB writes, no uploads)',
      '  - use --apply to actually regenerate invoices',
      '  - --packeta-delivered filters to orders with _packeta_status_code=7',
      '  - --fix-tax-total recalculates taxTotal from gross values before regeneration'
    ].join('\n')
  );
  process.exit(message ? 1 : 0);
};

const toNumber = (value: Prisma.Decimal | number | string | null | undefined) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? Number(value) : Number(value);
  return Number.isFinite(num) ? num : 0;
};

const PRODUCT_VAT_RATE = 0.19;
const SHIPPING_VAT_RATE = 0.23;
const grossToVat = (gross: number, vatRate: number) => (gross > 0 ? gross * (vatRate / (1 + vatRate)) : 0);

async function main() {
  const args = parseArgs();
  if (args.year === null || args.year < 2000 || args.year > 2100) usageAndExit('Missing/invalid --year');
  if (args.month === null || args.month < 1 || args.month > 12) usageAndExit('Missing/invalid --month (1-12)');

  const year = args.year as number;
  const month = args.month as number;
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month % 12, 1, 0, 0, 0, 0));

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lt: end },
      ...(args.packetaDeliveredOnly ? { meta: { some: { key: '_packeta_status_code', value: '7' } } } : {})
    },
    include: { items: true, addresses: true, meta: true },
    ...(args.limit ? { take: args.limit } : {})
  }) as OrderWithRelations[];

  console.log(
    `[invoices] Found ${orders.length} orders for ${year}-${String(month).padStart(2, '0')} (${start.toISOString()} .. ${end.toISOString()})` +
      (args.packetaDeliveredOnly ? ' [packeta delivered only]' : '') +
      (args.limit ? ` [limit=${args.limit}]` : '')
  );

  if (!args.apply) {
    const sample = orders.slice(0, 10).map(o => `${o.id} (${o.orderNumber ?? '—'})`);
    console.log('[invoices] DRY-RUN. First orders:', sample.length ? sample.join(', ') : '—');
    return;
  }

  for (const order of orders) {
    console.log(`[invoices] Regenerating for order ${order.id} (${order.orderNumber ?? '—'})`);

    if (args.fixTaxTotal) {
      const subtotal = toNumber(order.subtotal);
      const shippingTotal = toNumber(order.shippingTotal);
      const discountTotal = toNumber(order.discountTotal);
      const itemsGross = Math.max(0, subtotal - discountTotal);
      const newTaxTotal = Number((grossToVat(itemsGross, PRODUCT_VAT_RATE) + grossToVat(shippingTotal, SHIPPING_VAT_RATE)).toFixed(2));

      if (newTaxTotal !== toNumber(order.taxTotal)) {
        await prisma.order.update({
          where: { id: order.id },
          data: { taxTotal: new Prisma.Decimal(newTaxTotal.toFixed(2)) }
        });
        order.taxTotal = new Prisma.Decimal(newTaxTotal.toFixed(2));
        console.log(`  • taxTotal updated to ${newTaxTotal}`);
      }
    }

    const result = await createInvoiceForOrder(order, { force: true });
    if (result) {
      console.log(`  ✓ Generated ${result.invoiceNumber} -> ${result.url}`);
    } else {
      console.warn('  ⚠️ Skipped (no R2 config or other guard)');
    }
  }
}

main()
  .catch(err => {
    console.error('[invoices] Failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
