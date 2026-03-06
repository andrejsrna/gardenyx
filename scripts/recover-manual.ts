import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { finalizeOrder } from '../app/lib/checkout/finalize-order';
import prisma from '../app/lib/prisma';

async function main() {
  const orderId = 'cmmeooemu0000ftkcy1wlvmkk';
  console.log(`Finalizing order: ${orderId}...`);
  await finalizeOrder(orderId, { forceEmail: true, forcePacketa: true });
  console.log('Done.');
}
main().finally(() => prisma.$disconnect());
