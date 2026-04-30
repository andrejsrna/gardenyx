import Link from 'next/link';
import prisma from '../../lib/prisma';
import InvoiceExportForm from './InvoiceExportForm';

const requireEnv = (name: string) => process.env[name] ? 'OK' : 'Chýba';

export default async function SettingsPage() {
  const envStatus = [
    { name: 'POSTGRES_URL', status: requireEnv('POSTGRES_URL') },
    { name: 'PRISMA_DB_SCHEMA', status: process.env.PRISMA_DB_SCHEMA || 'nkv_admin (default)' },
    { name: 'BREVO_API_KEY', status: requireEnv('BREVO_API_KEY') },
    { name: 'BREVO_LIST_ID', status: process.env.BREVO_LIST_ID || '—' },
    { name: 'NEWSLETTER_ADMIN_TOKEN', status: requireEnv('NEWSLETTER_ADMIN_TOKEN') },
    { name: 'ADMIN_DASHBOARD_USER', status: process.env.ADMIN_DASHBOARD_USER || 'admin (default)' },
    { name: 'ADMIN_DASHBOARD_PASSWORD', status: requireEnv('ADMIN_DASHBOARD_PASSWORD') },
  ];

  const dbCheck = await prisma.$queryRawUnsafe<{ now: Date }[]>(`select now()`);
  const dbTime = dbCheck?.[0]?.now;

  const subscribersCount = await prisma.newsletterSubscriber.count();
  const activeCoupons = await prisma.$queryRawUnsafe<Array<{ code: string; type: string; percent: number | null; amount: string | null; usedCount: number; endsAt: Date | null }>>('SELECT code, type, percent, amount, "usedCount", "endsAt" FROM "Coupon" WHERE active = true ORDER BY "createdAt" DESC');
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <h1 className="text-3xl font-semibold text-white">Nastavenia</h1>
        <p className="mt-2 text-sm text-slate-300">Kontrolný prehľad konfigurácie a napojenia.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <h2 className="text-lg font-semibold text-white">Databáza a pripojenie</h2>
          <p className="mt-1 text-sm text-slate-300">Čas DB: {dbTime ? new Date(dbTime).toLocaleString('sk-SK') : '—'}</p>
          <p className="mt-1 text-sm text-slate-300">Schema: {process.env.PRISMA_DB_SCHEMA || 'nkv_admin (default)'}</p>
          <p className="mt-1 text-sm text-slate-300">Počet odberateľov: {subscribersCount}</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <h2 className="text-lg font-semibold text-white">Env prehľad</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {envStatus.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.name}</p>
                <p className={`mt-1 text-sm font-semibold ${item.status === 'OK' ? 'text-emerald-200' : 'text-amber-200'}`}>
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Aktívne kupóny</h2>
          <Link href="/admin/coupons" className="text-sm text-emerald-400 hover:underline">Spravovať →</Link>
        </div>
        {activeCoupons.length === 0 ? (
          <p className="text-sm text-slate-400">Žiadne aktívne kupóny.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeCoupons.map(c => (
              <div key={c.code} className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2">
                <span className="font-mono font-bold text-emerald-300">{c.code}</span>
                <span className="ml-2 text-sm text-slate-300">
                  {c.type === 'percent' ? `${c.percent}%` : `${Number(c.amount).toFixed(2)} €`}
                </span>
                <span className="ml-2 text-xs text-slate-500">({c.usedCount}×)</span>
                {c.endsAt && <span className="ml-2 text-xs text-amber-400">do {new Date(c.endsAt).toLocaleDateString('sk-SK')}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10 space-y-4">
        <h2 className="text-lg font-semibold text-white">Export faktúr</h2>
        <p className="text-sm text-slate-300">Vyber mesiac a rok, vygeneruje sa CSV s číslami objednávok, faktúr a linkami na stiahnutie.</p>
        <InvoiceExportForm />
      </div>
    </div>
  );
}
