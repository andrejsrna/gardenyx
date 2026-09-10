import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import prisma from '@/app/lib/prisma';
import { getArticleTranslation, getLocalizedArticleSlug, localeBcp47 } from '@/app/lib/article';

export const revalidate = 3600;

type BlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string; page?: string }>;
};

const CATEGORIES = ['all', 'vegetables', 'fruit', 'lawn', 'flowers', 'knowhow'] as const;
type Category = (typeof CATEGORIES)[number];
const PAGE_SIZE = 9;

function getCategoryFromSlug(slug: string): Category {
  const s = slug.toLowerCase();
  if (/(paprik|paradajk|zemiak|cesnak|cibul|zelenin|potato|pepper|garlic|onion|vegetable|burgonya|paprika|fokhagyma|hagyma|zoldseg)/.test(s))
    return 'vegetables';
  if (/(jahod|citrus|cucoried|ovocn|berry|strawberry|blueberry|eper|afonya|gyumolcs|fruit)/.test(s))
    return 'fruit';
  if (/(travnik|lawn|gyep)/.test(s)) return 'lawn';
  if (/(hortenzi|hydrangea|kvet|flower|virag)/.test(s)) return 'flowers';
  return 'knowhow';
}

export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { cat, page } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'blogIndex.meta' });
  const tFilters = await getTranslations({ locale, namespace: 'blogIndex.filters' });
  const baseTitle = t('title');
  const baseDesc = t('description');
  const activeCat = cat && (CATEGORIES as readonly string[]).includes(cat) ? cat : null;
  if (activeCat && activeCat !== 'all') {
    const catLabel = tFilters(activeCat as never) as string;
    return { title: `${catLabel}${page && page !== '1' ? ` (p. ${page})` : ''} — ${baseTitle}`, description: baseDesc };
  }
  if (page && page !== '1') return { title: `${baseTitle} (p. ${page})`, description: baseDesc };
  return { title: baseTitle, description: baseDesc };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { cat, page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blogIndex' });
  const activeCat: Category = cat && (CATEGORIES as readonly string[]).includes(cat) ? (cat as Category) : 'all';
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, slug: true, coverImage: true, publishedAt: true, translations: true },
  });

  const withCat = articles.map((a) => {
    const slugs = [a.slug, ...Object.values(a.translations as Record<string, { slug?: string }>).map((tr) => tr.slug ?? '')].join(' ');
    return { ...a, category: getCategoryFromSlug(slugs) as Category };
  });

  // counts per category
  const counts: Record<Category | 'all', number> = {
    all: withCat.length,
    vegetables: withCat.filter((a) => a.category === 'vegetables').length,
    fruit: withCat.filter((a) => a.category === 'fruit').length,
    lawn: withCat.filter((a) => a.category === 'lawn').length,
    flowers: withCat.filter((a) => a.category === 'flowers').length,
    knowhow: withCat.filter((a) => a.category === 'knowhow').length,
  };

  const filtered = activeCat === 'all' ? withCat : withCat.filter((a) => a.category === activeCat);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);
  const featured = safePage === 1 ? paginated[0] ?? null : null;
  const rest = featured ? paginated.slice(1) : paginated;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.gardenyx.eu';
  const paramsStr = [
    activeCat !== 'all' ? `cat=${activeCat}` : null,
    safePage > 1 ? `page=${safePage}` : null,
  ]
    .filter(Boolean)
    .join('&');
  const canonical = `${siteUrl}/${locale}/blog${paramsStr ? `?${paramsStr}` : ''}`;

  const itemList = paginated.map((a, i) => {
    const tr = getArticleTranslation(a.translations, locale);
    const lSlug = getLocalizedArticleSlug(a.slug, a.translations, locale);
    return { '@type': 'ListItem', position: start + i + 1, url: `${siteUrl}/${locale}/blog/${lSlug}`, name: tr.title || a.slug };
  });

  const buildHref = (p: number) => {
    const q: string[] = [];
    if (activeCat !== 'all') q.push(`cat=${activeCat}`);
    if (p > 1) q.push(`page=${p}`);
    return q.length ? `/blog?${q.join('&')}` : '/blog';
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-emerald-700">
                {t('breadcrumbs.home')}
              </Link>
            </li>
            <li aria-hidden className="text-gray-300">
              /
            </li>
            <li className="text-gray-900 font-medium" aria-current="page">
              {t('breadcrumbs.current')}
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="mt-3 text-gray-600 text-lg leading-relaxed">{t('description')}</p>
          <p className="mt-2 text-sm text-gray-500">{t('intro')}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Categories">
          {CATEGORIES.map((c) => {
            const isActive = c === activeCat;
            const label = t(`filters.${c}` as never) as string;
            const cnt = counts[c as Category | 'all'] ?? counts[c as keyof typeof counts] ?? 0;
            return (
              <Link
                key={c}
                href={(c === 'all' ? '/blog' : `/blog?cat=${c}`) as never}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'rounded-full bg-emerald-600 text-white px-4 py-1.5 text-sm font-medium'
                    : 'rounded-full border border-gray-200 bg-white text-gray-700 px-4 py-1.5 text-sm hover:border-emerald-300 hover:text-emerald-700'
                }
              >
                {label} <span className={isActive ? 'opacity-80' : 'text-gray-400'}>({cnt})</span>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-16">{activeCat === 'all' ? t('empty') : t('emptyFiltered')}</p>
        ) : (
          <>
            {featured && (() => {
              const tr = getArticleTranslation(featured.translations, locale);
              const title = tr.title || featured.slug;
              const lSlug = getLocalizedArticleSlug(featured.slug, featured.translations, locale);
              return (
                <Link
                  href={{ pathname: '/blog/[slug]', params: { slug: lSlug } }}
                  className="group mb-10 flex flex-col md:flex-row gap-0 rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-emerald-50/40"
                >
                  <div className="relative w-full md:w-[58%] aspect-[16/10] md:aspect-[16/9] overflow-hidden flex-shrink-0">
                    {featured.coverImage ? (
                      <Image src={featured.coverImage} alt={title} fill priority sizes="(max-width:768px) 100vw, 58vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🌱</div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1">{t('featured.badge')}</span>
                  </div>
                  <div className="flex flex-col p-6 md:p-8 flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug group-hover:text-emerald-700">{title}</h2>
                    {tr.excerpt && <p className="mt-3 text-gray-600 line-clamp-3 text-sm md:text-base">{tr.excerpt}</p>}
                    {featured.publishedAt && <time className="mt-auto pt-6 text-xs text-gray-400">{new Date(featured.publishedAt).toLocaleDateString(localeBcp47(locale))}</time>}
                  </div>
                </Link>
              );
            })()}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => {
                const tr = getArticleTranslation(article.translations, locale);
                const title = tr.title || article.slug;
                const lSlug = getLocalizedArticleSlug(article.slug, article.translations, locale);
                return (
                  <Link key={article.id} href={{ pathname: '/blog/[slug]', params: { slug: lSlug } }} className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      {article.coverImage ? <Image src={article.coverImage} alt={title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-4xl">🌱</div>}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur text-gray-700 text-[11px] font-medium px-2.5 py-1 border border-gray-100">{t(`filters.${article.category}` as never) as string}</span>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <h2 className="font-semibold text-gray-900 leading-snug group-hover:text-emerald-700 line-clamp-2">{title}</h2>
                      {tr.excerpt && <p className="mt-2 text-sm text-gray-500 line-clamp-3">{tr.excerpt}</p>}
                      {article.publishedAt && <time className="mt-auto pt-4 text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString(localeBcp47(locale))}</time>}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6" aria-label="Pagination">
                <div className="text-sm text-gray-500">{t('pagination.page', { page: safePage, total: totalPages })}</div>
                <div className="flex gap-2">
                  <Link href={buildHref(safePage - 1) as never} aria-disabled={safePage <= 1} className={`rounded-full border px-4 py-1.5 text-sm ${safePage <= 1 ? 'pointer-events-none opacity-40 border-gray-200 text-gray-400' : 'border-gray-200 hover:border-emerald-300 hover:text-emerald-700'}`}>
                    {t('pagination.previous')}
                  </Link>
                  <Link href={buildHref(safePage + 1) as never} aria-disabled={safePage >= totalPages} className={`rounded-full border px-4 py-1.5 text-sm ${safePage >= totalPages ? 'pointer-events-none opacity-40 border-gray-200 text-gray-400' : 'border-gray-200 hover:border-emerald-300 hover:text-emerald-700'}`}>
                    {t('pagination.next')}
                  </Link>
                </div>
              </nav>
            )}
          </>
        )}

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900">{t('shopCta.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shopCta.description')}</p>
            <Link href="/kupit" className="mt-4 inline-flex self-start rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-medium hover:bg-emerald-700">
              {t('shopCta.cta')}
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900">{t('newsletterCta.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('newsletterCta.description')}</p>
            <Link href="/newsletter" className="mt-4 inline-flex self-start rounded-full bg-white border border-gray-200 text-gray-900 px-5 py-2 text-sm font-medium hover:border-gray-300">
              {t('newsletterCta.cta')}
            </Link>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: t('title'), description: t('description'), url: canonical, inLanguage: localeBcp47(locale), hasPart: itemList }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: itemList }) }} />
    </main>
  );
}
