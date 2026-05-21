import { MetadataRoute } from 'next';
import { getAllProducts } from './lib/products';
import prisma from './lib/prisma';

const BASE_URL = 'https://www.gardenyx.eu';

type StaticRoute = {
  sk: string;
  en: string;
  hu: string;
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'];
  priority: number;
  lastModified: string;
};

const STATIC_ROUTES: StaticRoute[] = [
  { sk: '/sk', en: '/en', hu: '/hu', changeFrequency: 'daily', priority: 1.0, lastModified: '2026-04-26' },
  { sk: '/sk/kupit', en: '/en/shop', hu: '/hu/vasarlas', changeFrequency: 'weekly', priority: 0.9, lastModified: '2026-04-26' },
  { sk: '/sk/blog', en: '/en/blog', hu: '/hu/blog', changeFrequency: 'weekly', priority: 0.8, lastModified: '2026-04-26' },
  { sk: '/sk/hnojiva-hakofyt', en: '/en/hakofyt-fertilizers', hu: '/hu/hakofyt-mutragyak', changeFrequency: 'weekly', priority: 0.8, lastModified: '2026-04-26' },
  { sk: '/sk/hnojivo', en: '/en/fertilizer', hu: '/hu/mutragya', changeFrequency: 'weekly', priority: 0.85, lastModified: '2026-05-10' },
  { sk: '/sk/organicke-hnojivo', en: '/en/organic-fertilizer', hu: '/hu/szerves-mutragya', changeFrequency: 'weekly', priority: 0.82, lastModified: '2026-05-10' },
  { sk: '/sk/hnojivo-na-zeleninu', en: '/en/vegetable-fertilizer', hu: '/hu/zoldseg-mutragya', changeFrequency: 'monthly', priority: 0.74, lastModified: '2026-05-21' },
  { sk: '/sk/hnojivo-na-kvety', en: '/en/flower-fertilizer', hu: '/hu/virag-mutragya', changeFrequency: 'monthly', priority: 0.72, lastModified: '2026-05-21' },
  { sk: '/sk/hnojivo-na-travnik', en: '/en/lawn-fertilizer', hu: '/hu/gyeptragya', changeFrequency: 'monthly', priority: 0.7, lastModified: '2026-04-26' },
  { sk: '/sk/hnojivo-na-ovocne-stromy', en: '/en/fruit-tree-fertilizer', hu: '/hu/gyumolcsfa-tragya', changeFrequency: 'monthly', priority: 0.7, lastModified: '2026-04-27' },
  { sk: '/sk/kontakt', en: '/en/contact', hu: '/hu/kapcsolat', changeFrequency: 'monthly', priority: 0.6, lastModified: '2026-04-08' },
  { sk: '/sk/obchodne-podmienky', en: '/en/terms-and-conditions', hu: '/hu/aszf', changeFrequency: 'monthly', priority: 0.5, lastModified: '2026-04-08' },
  { sk: '/sk/ochrana-osobnych-udajov', en: '/en/privacy-policy', hu: '/hu/adatvedelem', changeFrequency: 'monthly', priority: 0.5, lastModified: '2026-04-08' },
  { sk: '/sk/doprava-a-platba', en: '/en/doprava-a-platba', hu: '/hu/doprava-a-platba', changeFrequency: 'monthly', priority: 0.5, lastModified: '2026-04-08' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || BASE_URL;

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.sk}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        sk: `${siteUrl}${route.sk}`,
        en: `${siteUrl}${route.en}`,
        hu: `${siteUrl}${route.hu}`,
      },
    },
  }));

  const [products, articles] = await Promise.all([
    getAllProducts(),
    prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/sk/produkt/${product.slug}`,
    lastModified: new Date('2026-04-26'),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: {
        sk: `${siteUrl}/sk/produkt/${product.slug}`,
        en: `${siteUrl}/en/product/${product.slug}`,
        hu: `${siteUrl}/hu/termek/${product.slug}`,
      },
    },
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/sk/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: {
      languages: {
        sk: `${siteUrl}/sk/blog/${article.slug}`,
        en: `${siteUrl}/en/blog/${article.slug}`,
        hu: `${siteUrl}/hu/blog/${article.slug}`,
      },
    },
  }));

  return [...staticEntries, ...productEntries, ...articleEntries];
}
