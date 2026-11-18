import prisma from '@/app/lib/prisma';
import { attachOrdersToUser as attach } from '@eshop-core/orders/attach';

export const attachOrdersToUser = (email: string, userId: string) => attach(prisma, email, userId);
