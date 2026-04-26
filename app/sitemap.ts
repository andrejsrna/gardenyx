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
};

const STATIC_ROUTES: StaticRoute[] = [
  { sk: '/', en: '/en', hu: '/hu', changeFrequency: 'daily', priority: 1.0 },
  { sk: '/kupit', en: '/en/shop', hu: '/hu/vasarlas', changeFrequency: 'weekly', priority: 0.9 },
  { sk: '/blog', en: '/en/blog', hu: '/hu/blog', changeFrequency: 'weekly', priority: 0.8 },
  { sk: '/hnojiva-hakofyt', en: '/en/hakofyt-fertilizers', hu: '/hu/hakofyt-mutragyak', changeFrequency: 'weekly', priority: 0.8 },
  { sk: '/hnojivo-na-travnik', en: '/en/lawn-fertilizer', hu: '/hu/gyeptragya', changeFrequency: 'monthly', priority: 0.7 },
  { sk: '/kontakt', en: '/en/contact', hu: '/hu/kapcsolat', changeFrequency: 'monthly', priority: 0.6 },
  { sk: '/obchodne-podmienky', en: '/en/terms-and-conditions', hu: '/hu/aszf', changeFrequency: 'monthly', priority: 0.5 },
  { sk: '/ochrana-osobnych-udajov', en: '/en/privacy-policy', hu: '/hu/adatvedelem', changeFrequency: 'monthly', priority: 0.5 },
  { sk: '/doprava-a-platba', en: '/en/doprava-a-platba', hu: '/hu/doprava-a-platba', changeFrequency: 'monthly', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || BASE_URL;

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.sk}`,
    lastModified: new Date(),
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
    url: `${siteUrl}/produkt/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: {
        sk: `${siteUrl}/produkt/${product.slug}`,
        en: `${siteUrl}/en/product/${product.slug}`,
        hu: `${siteUrl}/hu/termek/${product.slug}`,
      },
    },
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: {
      languages: {
        sk: `${siteUrl}/blog/${article.slug}`,
        en: `${siteUrl}/en/blog/${article.slug}`,
        hu: `${siteUrl}/hu/blog/${article.slug}`,
      },
    },
  }));

  return [...staticEntries, ...productEntries, ...articleEntries];
}
