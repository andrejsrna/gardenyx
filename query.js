const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const o = await prisma.order.findFirst({
    where: { transactionId: 'pi_3T7BsgK0qUjRbnOC0bvA6gy0' },
    include: { meta: true }
  });
  console.log('By transactionId:', o);

  const o2 = await prisma.orderMeta.findFirst({
    where: { value: 'pi_3T7BsgK0qUjRbnOC0bvA6gy0' },
    include: { order: true }
  });
  console.log('By meta:', o2);
}

main().finally(() => prisma.$disconnect());
