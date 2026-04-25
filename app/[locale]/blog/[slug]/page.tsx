import { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import prisma from '@/app/lib/prisma';
import { getArticleTranslation, localeBcp47, markdownToHtml } from '@/app/lib/article';

// Deduplicates the DB call between generateMetadata and the page component
// within a single request.
const getPublishedArticle = cache((slug: string) =>
  prisma.article.findUnique({ where: { slug, status: 'published' } })
);

type ArticlePageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return {};
  const t = getArticleTranslation(article.translations, locale);
  return {
    title: t.metaTitle || t.title || slug,
    description: t.metaDescription || t.excerpt || '',
    openGraph: {
      title: t.metaTitle || t.title || slug,
      description: t.metaDescription || t.excerpt || '',
      ...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  const t = getArticleTranslation(article.translations, locale);
  const title = t.title || article.slug;
  const contentHtml = t.content ? await markdownToHtml(t.content) : '';

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/blog" className="text-sm text-emerald-700 hover:text-emerald-600 mb-8 inline-block">
          ← {locale === 'sk' ? 'Späť na blog' : locale === 'hu' ? 'Vissza a blogra' : 'Back to blog'}
        </Link>

        {article.coverImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl mb-8">
            <Image src={article.coverImage} alt={title} fill className="object-cover" priority />
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

        {article.publishedAt && (
          <time className="text-sm text-gray-400 mb-8 block">
            {new Date(article.publishedAt).toLocaleDateString(localeBcp47(locale), {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}

        {t.excerpt && (
          <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-emerald-400 pl-4">
            {t.excerpt}
          </p>
        )}

        {contentHtml ? (
          <div
            className="prose prose-gray prose-headings:font-semibold prose-a:text-emerald-700 prose-img:rounded-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-gray-400">
            {locale === 'sk' ? 'Obsah nie je dostupný v tomto jazyku.' : locale === 'hu' ? 'A tartalom nem érhető el ezen a nyelven.' : 'Content not available in this language.'}
          </p>
        )}
      </div>
    </main>
  );
}
