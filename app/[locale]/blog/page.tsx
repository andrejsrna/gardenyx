import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import prisma from '@/app/lib/prisma';
import { getArticleTranslation, getLocalizedArticleSlug, localeBcp47 } from '@/app/lib/article';

export const dynamic = 'force-dynamic';

type BlogPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blogIndex.meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blogIndex' });

  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      coverImage: true,
      publishedAt: true,
      translations: true,
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-500 mb-10">{t('description')}</p>

        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-16">{t('empty')}</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const t = getArticleTranslation(article.translations, locale);
              const title = t.title || article.slug;
              const localizedSlug = getLocalizedArticleSlug(article.slug, article.translations, locale);

              return (
                <Link
                  key={article.id}
                  href={{ pathname: '/blog/[slug]', params: { slug: localizedSlug } }}
                  className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {article.coverImage ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={article.coverImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-emerald-50 flex items-center justify-center">
                      <span className="text-4xl">🌱</span>
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="font-semibold text-gray-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors">
                      {title}
                    </h2>
                    {t.excerpt && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">{t.excerpt}</p>
                    )}
                    {article.publishedAt && (
                      <time className="mt-auto pt-4 text-xs text-gray-400">
                        {new Date(article.publishedAt).toLocaleDateString(localeBcp47(locale))}
                      </time>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
