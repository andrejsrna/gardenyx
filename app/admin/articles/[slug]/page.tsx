import { notFound } from 'next/navigation';

import prisma from '@/app/lib/prisma';
import ArticleForm from '../ArticleForm';
import { updateArticleAction } from '../actions';
import DeleteArticleButton from '../DeleteArticleButton';

export const dynamic = 'force-dynamic';

type Translations = {
  sk: { title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string };
  en: { title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string };
  hu: { title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string };
};

function safeTranslations(raw: unknown): Translations {
  const empty = { title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' };
  if (!raw || typeof raw !== 'object') return { sk: empty, en: empty, hu: empty };
  const t = raw as Record<string, Record<string, string>>;
  const parse = (l: string) => ({
    title: t[l]?.title ?? '',
    excerpt: t[l]?.excerpt ?? '',
    content: t[l]?.content ?? '',
    metaTitle: t[l]?.metaTitle ?? '',
    metaDescription: t[l]?.metaDescription ?? '',
  });
  return { sk: parse('sk'), en: parse('en'), hu: parse('hu') };
}

export default async function AdminEditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) notFound();

  const publishedAt = article.publishedAt
    ? new Date(article.publishedAt).toISOString().slice(0, 16)
    : '';

  const initial = {
    id: article.id,
    slug: article.slug,
    status: article.status,
    coverImage: article.coverImage ?? '',
    publishedAt,
    translations: safeTranslations(article.translations),
  };

  return (
    <div className="space-y-6">
      <ArticleForm
        initial={initial}
        action={updateArticleAction}
        title={`Upraviť: ${initial.translations.sk.title || article.slug}`}
      />

      <div className="rounded-3xl border border-red-900/40 bg-red-950/20 p-6">
        <h2 className="text-sm font-semibold text-red-300">Nebezpečná zóna</h2>
        <p className="mt-1 text-xs text-red-400">Táto akcia je nenávratná.</p>
        <div className="mt-4">
          <DeleteArticleButton id={article.id} />
        </div>
      </div>
    </div>
  );
}
