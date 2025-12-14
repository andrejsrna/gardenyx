import prisma from './prisma';

export async function isReactivationFlowEnabled(): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: 'reactivation_flow' },
      select: { enabled: true },
    });
    return flag?.enabled ?? false;
  } catch (error) {
    console.error('[feature-flags] Failed to read reactivation_flow', error);
    return false;
  }
}
