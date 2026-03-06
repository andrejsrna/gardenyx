import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({});

async function main() {
  const o = await prisma.order.findFirst({
    where: { transactionId: 'pi_3T7BsgK0qUjRbnOC0bvA6gy0' },
    include: { meta: true }
  });
  console.log('By transactionId:', o);
}
main().finally(() => prisma.$disconnect());