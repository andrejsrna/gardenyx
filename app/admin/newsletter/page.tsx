import Link from 'next/link';

import prisma from '../../lib/prisma';

type SubscriberRow = {
  email: string;
  status: string;
  source?: string | null;
  createdAt: Date;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  } | undefined>;
};

export default async function NewsletterPage({ searchParams }: PageProps) {
  const limit = 50;
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params?.page) || 1);
  const skip = (currentPage - 1) * limit;

  const [subscribers, total, unsubscribed] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      select: {
        email: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: 'unsubscribed' } }),
  ]);

  const active = total - unsubscribed;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const stats = [
    { label: 'Odberatelia', value: active.toString(), delta: total ? `${((active / total) * 100).toFixed(1)}% aktívni` : '—' },
    { label: 'Odhlásenia', value: unsubscribed.toString(), delta: total ? `${((unsubscribed / total) * 100).toFixed(1)}%` : '—' },
    { label: 'Nové (50)', value: subscribers.filter((s: SubscriberRow) => s.status === 'active').length.toString(), delta: 'Posledných 50 záznamov' },
    { label: 'Celkový počet', value: total.toString(), delta: 'Všetky segmenty' },
  ];

  const recentCampaigns = [
    { name: 'Správa: aktívne kampane', sent: '—', open: '—', click: '—' },
  ];

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/25">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Newsletter</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Správa odberov</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Prehľad odberateľov, posledných kampaní a rýchla tvorba nového emailu. Integrácie zatiaľ nie sú
              napojené – wiring na provider pridáme, keď si vyberiete službu.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:bg-emerald-500/30">
              Importovať CSV
            </button>
            <Link
              href="/admin"
              className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100"
            >
              Späť na dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-emerald-900/10"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs font-medium text-emerald-300">{item.delta}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Odberatelia</h2>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-700 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-emerald-400/60">
                  Export CSV
                </button>
                <button className="rounded-lg border border-emerald-400/70 bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-50 hover:bg-emerald-500/30">
                  Pridať odberateľa
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-900/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Stav</th>
                    <th className="px-4 py-3 text-left font-medium">Zdroj</th>
                    <th className="px-4 py-3 text-left font-medium">Pridaný</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {subscribers.map((subscriber: SubscriberRow) => (
                <tr key={subscriber.email} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">{subscriber.email}</td>
                  <td className="px-4 py-3">
                    <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            subscriber.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-200'
                              : 'bg-amber-500/15 text-amber-200'
                          }`}
                        >
                          {subscriber.status === 'active' ? 'Aktívny' : 'Odhlásený'}
                        </span>
                      </td>
                  <td className="px-4 py-3 text-slate-300">{subscriber.source || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(subscriber.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
              <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-sm text-slate-300">
                <span>Strana {currentPage} / {totalPages}</span>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/newsletter?page=${Math.max(1, currentPage - 1)}`}
                    className={`rounded-lg px-3 py-2 ${currentPage === 1 ? 'cursor-not-allowed border border-slate-800 text-slate-600' : 'border border-slate-700 text-slate-200 hover:border-emerald-400/70'}`}
                    aria-disabled={currentPage === 1}
                  >
                    Predchádzajúca
                  </Link>
                  <Link
                    href={`/admin/newsletter?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={`rounded-lg px-3 py-2 ${currentPage >= totalPages ? 'cursor-not-allowed border border-slate-800 text-slate-600' : 'border border-slate-700 text-slate-200 hover:border-emerald-400/70'}`}
                    aria-disabled={currentPage >= totalPages}
                  >
                    Ďalšia
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Posledné kampane</h2>
              <button className="text-sm text-emerald-300 hover:text-emerald-200">Detail kampaní</button>
            </div>
            <div className="mt-4 space-y-3">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.name} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div>
                    <p className="text-base font-semibold text-white">{campaign.name}</p>
                    <p className="text-xs text-slate-400">Odoslané: {campaign.sent}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-300">Open {campaign.open}</span>
                    <span className="text-emerald-200">CTR {campaign.click}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-white/5 via-slate-900 to-slate-950 p-6 shadow-xl shadow-emerald-900/15">
            <h3 className="text-lg font-semibold text-white">Nová kampaň</h3>
            <form className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Predmet</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  placeholder="Nový článok: Ako na kolená"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Segment</label>
                <select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none">
                  <option>Všetci odberatelia</option>
                  <option>Aktívni zákazníci</option>
                  <option>Blog odbery</option>
                  <option>Recentný nákup (30d)</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Teaser / prvý odstavec</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  rows={4}
                  placeholder="Krátke intro pre inbox náhľad…"
                />
              </div>
              <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400">
                Uložiť koncept
              </button>
              <button className="w-full rounded-xl border border-emerald-400/70 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/20">
                Poslať testovací email
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
            <h3 className="text-lg font-semibold text-white">Šablóny</h3>
            <div className="mt-4 space-y-3">
              {['Nový článok', 'Zľavový kód', 'Follow-up po nákupe', 'Edukačný tip'].map((template) => (
                <button
                  key={template}
                  className="w-full rounded-xl border border-slate-700 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-emerald-400/60 hover:bg-white/10"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
