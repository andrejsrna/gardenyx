import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

export type ArticleTranslation = {
  title?: string;
  excerpt?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export function getArticleTranslation(translations: unknown, locale: string): ArticleTranslation {
  if (!translations || typeof translations !== 'object') return {};
  const t = translations as Record<string, ArticleTranslation>;
  return t[locale] ?? t['sk'] ?? {};
}

export function localeBcp47(locale: string): string {
  return locale === 'sk' ? 'sk-SK' : locale === 'hu' ? 'hu-HU' : 'en-GB';
}

export async function markdownToHtml(md: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(md);
  return result.toString();
}
