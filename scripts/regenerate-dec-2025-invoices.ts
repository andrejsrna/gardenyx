import { Prisma } from '@prisma/client';
import prisma from '../app/lib/prisma';
import { createInvoiceForOrder, type OrderWithRelations } from '../app/lib/invoice/create-invoice';

const START = new Date('2025-12-01T00:00:00.000Z');
const END = new Date('2026-01-01T00:00:00.000Z');
const INVOICE_META_KEYS = ['_invoice_created_at', '_invoice_url', '_invoice_filename', '_invoice_number'];
const VAT_RATE = 0.19;

const toNumber = (value: Prisma.Decimal | number | string | null | undefined) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? Number(value) : Number(value);
  return Number.isFinite(num) ? num : 0;
};

const grossToVat = (gross: number) => (gross > 0 ? gross * (VAT_RATE / (1 + VAT_RATE)) : 0);

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: START, lt: END },
      meta: { some: { key: '_packeta_status_code', value: '7' } }
    },
    include: { items: true, addresses: true, meta: true }
  }) as OrderWithRelations[];

  console.log(`[invoices] Found ${orders.length} orders for Dec 2025 with Packeta status delivered`);

  for (const order of orders) {
    console.log(`[invoices] Regenerating for order ${order.id} (${order.orderNumber})`);

    // ensure taxTotal is correctly set from gross values (items + shipping already s DPH)
    const subtotal = toNumber(order.subtotal);
    const shippingTotal = toNumber(order.shippingTotal);
    const discountTotal = toNumber(order.discountTotal);
    const itemsGross = Math.max(0, subtotal - discountTotal);
    const newTaxTotal = Number((grossToVat(itemsGross) + grossToVat(shippingTotal)).toFixed(2));

    if (newTaxTotal !== toNumber(order.taxTotal)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { taxTotal: new Prisma.Decimal(newTaxTotal.toFixed(2)) }
      });
      order.taxTotal = new Prisma.Decimal(newTaxTotal.toFixed(2));
      console.log(`  • taxTotal updated to ${newTaxTotal}`);
    }

    await prisma.orderMeta.deleteMany({
      where: { orderId: order.id, key: { in: INVOICE_META_KEYS } }
    });

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
