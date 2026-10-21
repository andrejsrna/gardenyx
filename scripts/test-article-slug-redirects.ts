import 'dotenv/config';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import prisma from '../app/lib/prisma';
import { generatePreviewToken } from '../app/lib/preview';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3383';
const canonicalSlug = 'ako-a-kedy-hnojit-travnik-na-jar';
const slugs = {
  sk: canonicalSlug,
  en: 'how-and-when-to-fertilize-your-lawn-in-spring',
  hu: 'hogyan-es-mikor-tragyazzuk-a-gyepet-tavasszal',
};

async function main() {
  for (const locale of ['en', 'hu'] as const) {
    const response = await fetch(`${base}/${locale}/blog/${canonicalSlug}`, { redirect: 'manual' });
    assert.equal(response.status, 308, `${locale}: wrong-language slug must redirect permanently`);
    assert.equal(new URL(response.headers.get('location')!, base).pathname, `/${locale}/blog/${slugs[locale]}`);
  }
  for (const locale of ['sk', 'en', 'hu'] as const) {
    const path = `/${locale}/blog/${slugs[locale]}`;
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, 200, `${locale}: correct slug must not redirect`);
    const $ = load(await response.text());
    assert.equal(new URL($('link[rel="canonical"]').attr('href')!).pathname, path);
    assert.equal($('link[hreflang]').length, 3);
  }
  // Preserve existing not-found rendering: Next.js can stream it with HTTP 200.
  const missing = await fetch(`${base}/en/blog/does-not-exist-seo-regression-test`, { redirect: 'manual' });
  assert.ok(missing.status === 200 || missing.status === 404);
  const missingHtml = load(await missing.text());
  assert.match(missingHtml('meta[name="robots"]').attr('content') || '', /noindex/);
  assert.equal(missing.headers.get('location'), null);
  const invalidPreview = await fetch(`${base}/en/blog/${canonicalSlug}?preview=invalid`, { redirect: 'manual' });
  assert.equal(invalidPreview.status, 308, 'Invalid preview must use public redirect rules');

  // Only run signed-preview checks locally; never send private preview tokens to production logs.
  if (new URL(base).hostname === '127.0.0.1') {
    const article = await prisma.article.findUniqueOrThrow({ where: { slug: canonicalSlug } });
    const token = generatePreviewToken(article.id, article.updatedAt);
    const preview = await fetch(`${base}/en/blog/${canonicalSlug}?preview=${token}`, { redirect: 'manual' });
    assert.equal(preview.status, 200, 'Valid signed preview must not redirect');
    const $ = load(await preview.text());
    assert.match($('meta[name="robots"]').attr('content') || '', /noindex/);
  }
  console.log('PASS: EN/HU aliases 308; SK/EN/HU localized URLs 200 with canonical/hreflang; unknown URL remains noindex without redirect; preview behavior preserved.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
