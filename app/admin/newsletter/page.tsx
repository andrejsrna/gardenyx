import Link from 'next/link';

import prisma from '../../lib/prisma';

type SubscriberRow = {
  email: string;
  firstName: string | null;
  lastName: string | null;
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
        firstName: true,
        lastName: true,
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
    { label: 'Aktívni odberatelia', value: active.toString(), delta: total ? `${((active / total) * 100).toFixed(1)}% z celkového počtu` : '—' },
    { label: 'Odhlásenia', value: unsubscribed.toString(), delta: total ? `${((unsubscribed / total) * 100).toFixed(1)}%` : '—' },
    { label: 'Celkový počet', value: total.toString(), delta: 'Všetky segmenty' },
  ];

  const csvRows = [
    ['Email', 'Meno', 'Priezvisko', 'Stav', 'Zdroj', 'Dátum'].join(','),
    ...subscribers.map((s: SubscriberRow) =>
      [s.email, s.firstName ?? '', s.lastName ?? '', s.status, s.source ?? '', formatDate(s.createdAt)].join(',')
    ),
  ].join('\n');

  const csvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvRows)}`;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/25">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Newsletter</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Odberatelia</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Prehľad odberateľov a export zoznamu.
            </p>
          </div>
          <Link
            href="/admin"
            className="self-start rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100"
          >
            Späť na dashboard
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
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

      {/* Subscriber table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Zoznam odberateľov</h2>
          <a
            href={csvDataUri}
            download="newsletter-subscribers.csv"
            className="rounded-lg border border-slate-700 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-emerald-400/60"
          >
            Export CSV
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Meno</th>
                <th className="px-4 py-3 text-left font-medium">Stav</th>
                <th className="px-4 py-3 text-left font-medium">Zdroj</th>
                <th className="px-4 py-3 text-left font-medium">Pridaný</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {subscribers.map((subscriber: SubscriberRow) => (
                <tr key={subscriber.email} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">{subscriber.email}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {[subscriber.firstName, subscriber.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
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
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Zatiaľ žiadni odberatelia.
                  </td>
                </tr>
              )}
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
    </div>
  );
}
