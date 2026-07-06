import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { isAutomationAuthorized } from '@/app/lib/automation/config';
import { sendNewsletterDigest, DigestArticle } from '@/app/lib/email/newsletter-digest';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ArticleTranslation = {
  locale: string;
  title?: string;
  excerpt?: string;
  slug?: string;
};

type ArticleRow = {
  id: string;
  slug: string;
  coverImage: string | null;
  publishedAt: Date | null;
  translations: unknown;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pull the best available translation for a given locale (falls back to 'sk').
 */
function pickTranslation(
  translations: unknown,
  locale: string
): { title: string; excerpt: string; slug: string } {
  const map = (translations as Record<string, ArticleTranslation> | null) ?? {};

  const candidate: Partial<ArticleTranslation> =
    map[locale] ?? map['sk'] ?? Object.values(map)[0] ?? {};

  return {
    title: candidate.title || '(bez názvu)',
    excerpt: candidate.excerpt || '',
    slug: candidate.slug || '',
  };
}

function buildDigestArticles(rows: ArticleRow[], locale: string): DigestArticle[] {
  return rows.map((row) => {
    const t = pickTranslation(row.translations, locale);
    return {
      slug: t.slug || row.slug,
      title: t.title,
      excerpt: t.excerpt,
      coverImage: row.coverImage,
    };
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // -------------------------------------------------------------------
  // 1. Fetch articles published in the last 7 days (max 3)
  // -------------------------------------------------------------------
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      publishedAt: { gte: since },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      slug: true,
      coverImage: true,
      publishedAt: true,
      translations: true,
    },
  });

  if (articles.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'no_new_articles' });
  }

  // -------------------------------------------------------------------
  // 2. Fetch active subscribers
  // -------------------------------------------------------------------
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: 'active' },
    select: {
      email: true,
      firstName: true,
      source: true,
    },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'no_active_subscribers' });
  }

  // -------------------------------------------------------------------
  // 3. Send – one email per subscriber, locale from source field
  //    Convention: source can carry a locale hint like "footer:sk", "popup:en".
  //    Falls back to 'sk'.
  // -------------------------------------------------------------------
  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      // Extract locale from source field (e.g. "footer:en" → "en")
      // or fall back to 'sk'
      const locale = sub.source?.split(':').pop()?.trim() || 'sk';
      const digestArticles = buildDigestArticles(articles, locale);

      await sendNewsletterDigest({
        to: sub.email,
        firstName: sub.firstName,
        locale,
        articles: digestArticles,
      });

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${sub.email}: ${msg}`);
      console.error('[newsletter-weekly] Failed to send to', sub.email, msg);
    }
  }

  return NextResponse.json({
    sent,
    total: subscribers.length,
    articles: articles.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
