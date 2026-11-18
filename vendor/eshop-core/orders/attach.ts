/** Subset of the Prisma client used here (pass `prisma`). */
export interface AttachOrdersDb {
  order: {
    updateMany(args: {
      where: { userId: null; addresses: { some: { type: 'BILLING'; email: string } } };
      data: { userId: string };
    }): PromiseLike<unknown>;
  };
}

/** Links guest orders placed with this billing e-mail to the account (after login/registration). */
export async function attachOrdersToUser(db: AttachOrdersDb, email: string, userId: string) {
  const normalizedEmail = email.toLowerCase();
  try {
    await db.order.updateMany({
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
