import Link from 'next/link';

import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

function getTitle(translations: unknown, locale = 'sk'): string {
  if (!translations || typeof translations !== 'object') return '—';
  const t = translations as Record<string, Record<string, string>>;
  return t[locale]?.title || t['sk']?.title || t['en']?.title || '—';
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  // The table only renders: SK title (from translations), slug, status,
  // publishedAt, and which locale keys have a title. Pull translations for the
  // title/langs check but skip coverImage and createdAt.
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      translations: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Články</h1>
            <p className="mt-1 text-sm text-slate-300">
              Trojjazyčné články (SK / EN / HU) pre blog.
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            + Nový článok
          </Link>
        </div>

        {params.saved ? (
          <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Článok bol uložený.
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-emerald-900/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nadpis (SK)</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Stav</th>
                <th className="px-4 py-3 text-left font-medium">Publikované</th>
                <th className="px-4 py-3 text-left font-medium">Jazyky</th>
                <th className="px-4 py-3 text-right font-medium">Akcia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {articles.map((article) => {
                const t = article.translations && typeof article.translations === 'object'
                  ? article.translations as Record<string, Record<string, string>>
                  : {};
                const langs = (['sk', 'en', 'hu'] as const).filter((l) => t[l]?.title);

                return (
                  <tr key={article.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{getTitle(article.translations)}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{article.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        article.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('sk-SK')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {langs.length ? langs.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/articles/${article.slug}`}
                        className="inline-flex rounded-xl border border-emerald-500/40 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/10"
                      >
                        Upraviť
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-300">
                    Zatiaľ žiadne články. Klikni na „+ Nový článok&quot;.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
