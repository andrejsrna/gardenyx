import { NextResponse } from 'next/server';

import prisma from '@/app/lib/prisma';
import { getArticleTranslation, getLocalizedArticleSlug } from '@/app/lib/article';

const SUPPORTED_LOCALES = new Set(['sk', 'en', 'hu']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug')?.trim();
  const targetLocale = searchParams.get('targetLocale')?.trim() || searchParams.get('locale')?.trim();

  if (!slug || !targetLocale || !SUPPORTED_LOCALES.has(targetLocale)) {
    return NextResponse.json({ error: 'Missing or invalid slug/targetLocale' }, { status: 400 });
  }

  const byCanonicalSlug = await prisma.article.findFirst({
    where: { slug, status: 'published' },
    select: { slug: true, translations: true },
  });

  const article = byCanonicalSlug ?? (await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, translations: true },
  })).find((candidate) => {
    return ['sk', 'en', 'hu'].some((locale) => getArticleTranslation(candidate.translations, locale).slug === slug);
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const localizedSlug = getLocalizedArticleSlug(article.slug, article.translations, targetLocale);

  return NextResponse.json({
    path: `/${targetLocale}/blog/${localizedSlug}`,
    slug: localizedSlug,
  });
}
