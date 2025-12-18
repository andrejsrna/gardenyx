import 'dotenv/config';
import prisma from '../app/lib/prisma';
import { createInvoiceForOrder, OrderWithRelations } from '../app/lib/invoice/create-invoice';

async function main() {
  const args = process.argv.slice(2);
  const forceIndex = args.indexOf('--force');
  const force = forceIndex > -1;
  if (force) {
    args.splice(forceIndex, 1);
  }
  const orderId = args[0];
  if (!orderId) {
    console.error('Usage: npm run generate-invoice <orderId> [--force]');
    process.exit(1);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true, meta: true }
  });

  if (!order) {
    console.error(`Order ${orderId} not found`);
    process.exit(1);
  }

  const invoiceResult = await createInvoiceForOrder(order as OrderWithRelations, { force });
  if (invoiceResult) {
    console.log('Invoice generated:', invoiceResult.invoiceNumber, invoiceResult.url);
  } else {
    console.log('Invoice was skipped (maybe already exists or R2 config missing)');
  }
}

main().catch(err => {
  console.error('Invoice generation failed:', err);
  process.exit(1);
});
