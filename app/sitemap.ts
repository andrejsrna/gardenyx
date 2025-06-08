import { MetadataRoute } from 'next';
import { WooCommerceProduct, WordPressPost, getWooCommerceUrl } from './lib/wordpress';

const BASE_URL = 'https://najsilnejsiaklbovavyziva.sk';
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk';
const WORDPRESS_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;

const STATIC_ROUTES = [
  '',
  '/kupit',
  '/blog',
  '/zlozenie',
  '/obchodne-podmienky',
  '/ochrana-osobnych-udajov',
  '/doprava-a-platba',
  '/uzivanie',
  '/casto-kladene-otazky',
  '/kontakt',
  '/registracia',
  '/reklamacie',
  '/moj-ucet',
];

const INGREDIENT_ROUTES = [
  '/zlozenie/glukozamin',
  '/zlozenie/chondroitin',
  '/zlozenie/boswellia-serata',
  '/zlozenie/boswellia',
  '/zlozenie/kyselina-hyaluronova',
  '/zlozenie/cierne-korenie',
  '/zlozenie/kurkuma',
  '/zlozenie/kolagen',
  '/zlozenie/vitamin-c',
  '/zlozenie/msm',
];

async function getProducts(): Promise<WooCommerceProduct[]> {
  try {
    const url = getWooCommerceUrl('products', { per_page: '100', status: 'publish' });
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

async function getBlogPosts(): Promise<WordPressPost[]> {
  try {
    const url = `${WORDPRESS_API_URL}/posts?per_page=100&status=publish`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    getProducts(),
    getBlogPosts(),
  ]);

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route === '/blog' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/kupit' ? 0.9 : 0.8,
  }));

  const ingredientUrls: MetadataRoute.Sitemap = INGREDIENT_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produkt/${product.slug}`,
    lastModified: new Date(product.date_modified),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...ingredientUrls, ...productUrls, ...blogUrls];
} 