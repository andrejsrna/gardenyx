import prisma from '@/app/lib/prisma';

export async function attachOrdersToUser(email: string, userId: string) {
  const normalizedEmail = email.toLowerCase();
  try {
    await prisma.order.updateMany({
      where: {
        userId: null,
        addresses: {
          some: {
            type: 'BILLING',
            email: normalizedEmail
          }
        }
      },
      data: {
        userId
      }
    });
  } catch (error) {
    console.warn('[attachOrdersToUser] failed', error);
  }
}
