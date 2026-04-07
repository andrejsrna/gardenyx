import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import prisma from './app/lib/prisma';
async function main() {
  const p = await prisma.product.findUnique({ where: { wcId: 47 } });
  console.log(p);
}
main().finally(() => prisma.$disconnect());
