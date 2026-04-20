import { MetadataRoute } from 'next';
import { getAllProducts } from './lib/products';
import prisma from './lib/prisma';

const BASE_URL = 'https://gardenyx.eu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || BASE_URL;

  const staticRoutes = [
    { url: '/', changeFrequency: 'daily', priority: 1.0 },
    { url: '/kupit', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/hnojiva-hakofyt', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/kontakt', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/obchodne-podmienky', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/ochrana-osobnych-udajov', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/doprava-a-platba', changeFrequency: 'monthly', priority: 0.5 },
  ].map((route) => ({
    url: `${siteUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: route.priority,
  }));

  const [products, articles] = await Promise.all([
    getAllProducts(),
    prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/produkt/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productUrls, ...articleUrls];
}
