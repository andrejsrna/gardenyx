import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { syncPacketaStatuses } from '@eshop-core/packeta/sync';
import { sendInvoiceLinkEmail, sendPacketaStatusEmail, sendReturnNoticeEmail } from '@/app/lib/email/order-confirmation';
import { createInvoiceForOrder } from '@/app/lib/invoice/create-invoice';

type SyncOrder = Prisma.OrderGetPayload<{ include: { meta: true; items: true; addresses: true } }>;

/** Packeta status sync with this shop's invoice and e-mail hooks (cron + admin order list). */
export function syncOrderPacketaStatuses(orderIds?: string[]) {
  return syncPacketaStatuses<SyncOrder>({
    db: prisma,
    transaction: fn => prisma.$transaction(tx => fn(tx)),
    returnNotifyAfter: process.env.RETURN_NOTIFY_AFTER ? new Date(process.env.RETURN_NOTIFY_AFTER) : undefined,
    async onDelivered(order, billingEmail) {
      const invoice = await createInvoiceForOrder(order);
      if (invoice && billingEmail) await sendInvoiceLinkEmail(order, billingEmail, invoice.url, invoice.invoiceNumber);
    },
    onStatusNotify: (order, billingEmail, code, barcode) => sendPacketaStatusEmail(order, billingEmail, code, barcode),
    onReturned: (order, billingEmail) => sendReturnNoticeEmail(order, billingEmail),
  }, orderIds);
}
