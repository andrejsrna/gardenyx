import { MetadataRoute } from 'next';
import { WordPressPost, WordPressCategory } from './lib/content';
import { getLocalPosts as getLocalWordPressPosts, getLocalCategories as getLocalWordPressCategories } from './lib/local-posts';
import { getAllProducts } from './lib/products';

const BASE_URL = 'https://najsilnejsiaklbovavyziva.sk';

// Fetch products and posts from local sources
const getProducts = () => getAllProducts();
const getPosts = async (): Promise<WordPressPost[]> => getLocalWordPressPosts();
const getCategories = async (): Promise<WordPressCategory[]> => getLocalWordPressCategories();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || BASE_URL;

  // Define static routes
  const staticRoutes = [
    { url: '/', changeFrequency: 'daily', priority: 1.0 },
    { url: '/kupit', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/zlozenie', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/casto-kladene-otazky', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/obchodne-podmienky', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/ochrana-osobnych-udajov', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/doprava-a-platba', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/uzivanie', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/kontakt', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/registracia', changeFrequency: 'yearly', priority: 0.4 },
    { url: '/reklamacie', changeFrequency: 'yearly', priority: 0.4 },
    { url: '/moj-ucet', changeFrequency: 'yearly', priority: 0.4 },
  ].map(route => ({
    url: `${siteUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: route.priority,
  }));

  const ingredientRoutes = [
    '/zlozenie/glukozamin', '/zlozenie/chondroitin', '/zlozenie/boswellia-serata', 
    '/zlozenie/boswellia', '/zlozenie/kyselina-hyaluronova', '/zlozenie/cierne-korenie',
    '/zlozenie/kurkuma', '/zlozenie/kolagen', '/zlozenie/vitamin-c', '/zlozenie/msm'
  ].map(path => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Fetch all dynamic data in parallel
  const [products, posts, categories, localPosts, localCategories] = await Promise.all([
    getProducts(),
    getPosts(),
    getCategories(),
    getLocalWordPressPosts(),
    getLocalWordPressCategories(),
  ]);

  const productUrls = products.map((product) => ({
    url: `${siteUrl}/produkt/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const postUrlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  posts.forEach((post) => {
    const url = `${siteUrl}/${post.slug}`;
    postUrlMap.set(url, {
      url,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.6,
    });
  });

  localPosts.forEach((post) => {
    const url = `${siteUrl}/${post.slug}`;
    postUrlMap.set(url, {
      url,
      lastModified: new Date(post.meta?.updated || post.date),
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.6,
    });
  });

  const postUrls = Array.from(postUrlMap.values());

  const categoryUrlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  categories.forEach((category) => {
    const url = `${siteUrl}/blog/kategoria/${category.slug}`;
    categoryUrlMap.set(url, {
      url,
      lastModified: new Date(),
      changeFrequency: 'weekly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.7,
    });
  });

  localCategories.forEach((category) => {
    const url = `${siteUrl}/blog/kategoria/${category.slug}`;
    categoryUrlMap.set(url, {
      url,
      lastModified: new Date(),
      changeFrequency: 'weekly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.7,
    });
  });

  const categoryUrls = Array.from(categoryUrlMap.values());

  return [
    ...staticRoutes,
    ...ingredientRoutes,
    ...productUrls,
    ...postUrls,
    ...categoryUrls,
  ];
} 
