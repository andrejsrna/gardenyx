import type { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { createFinalizeOrder } from '@eshop-core/checkout/finalize-order';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { createPacketaPacketForOrder } from '@/app/lib/packeta';

type FinalizeOrder = Prisma.OrderGetPayload<{ include: { items: true; addresses: true; meta: true } }>;

export const finalizeOrder = createFinalizeOrder({
  db: prisma,
  async sendOrderEmails(order: FinalizeOrder, billingEmail: string) {
    await sendOrderConfirmationEmail(order, billingEmail);
    await sendOrderNotificationToAdmin(order, billingEmail);
  },
  createPacketaPacket: createPacketaPacketForOrder,
});
