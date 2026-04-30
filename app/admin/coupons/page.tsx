import prisma from '@/app/lib/prisma';
import { getAutomationAdminToken } from '@/app/lib/automation/config';
import CouponsClient from './CouponsClient';

export const dynamic = 'force-dynamic';

export default async function CouponsAdminPage() {
  const coupons = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      code: string;
      description: string | null;
      type: string;
      amount: string | null;
      percent: number | null;
      freeShipping: boolean;
      active: boolean;
      startsAt: Date | null;
      endsAt: Date | null;
      minOrderTotal: string | null;
      maxUses: number | null;
      usedCount: number;
      maxUsesPerEmail: number | null;
      createdAt: Date;
    }>
  >('SELECT * FROM "Coupon" ORDER BY "createdAt" DESC');

  const adminToken = getAutomationAdminToken() || '';

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <h1 className="text-3xl font-semibold text-white">Kupóny</h1>
        <p className="mt-2 text-sm text-slate-300">Správa zľavových kódov a kupónov.</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <CouponsClient initialCoupons={coupons} adminToken={adminToken} />
      </div>
    </div>
  );
}
