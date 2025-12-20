import prisma from '../../lib/prisma';
import ReactivationToggle from './ReactivationToggle';
import ReactivationPreview from './ReactivationPreview';
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
  const reactivationFlag = await prisma.featureFlag.upsert({
    where: { key: 'reactivation_flow' },
    create: { key: 'reactivation_flow', enabled: false, description: 'Reactivation flow 30–45 dní' },
    update: {},
  });

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
        <h2 className="text-lg font-semibold text-white">Flows</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ReactivationToggle initialEnabled={reactivationFlag.enabled} adminToken={process.env.NEWSLETTER_ADMIN_TOKEN} />
          <ReactivationPreview />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10 space-y-4">
        <h2 className="text-lg font-semibold text-white">Export faktúr</h2>
        <p className="text-sm text-slate-300">Vyber mesiac a rok, vygeneruje sa CSV s číslami objednávok, faktúr a linkami na stiahnutie.</p>
        <InvoiceExportForm />
      </div>
    </div>
  );
}
