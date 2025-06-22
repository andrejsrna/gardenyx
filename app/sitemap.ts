import { MetadataRoute } from 'next';
import { WooCommerceProduct, WordPressPost, WordPressCategory } from './lib/wordpress';

const BASE_URL = 'https://najsilnejsiaklbovavyziva.sk';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk'}/wp-json`;
const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY || '';
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET || '';

// Helper function to fetch data from an API with revalidation
async function fetchApiData<T>(url: string, errorMessage: string): Promise<T[]> {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`${errorMessage} (status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Sitemap fetch error from ${url}:`, error);
    return [];
  }
}

// Fetch all published WooCommerce products
const getProducts = () => {
  const params = new URLSearchParams({
    per_page: '100',
    status: 'publish',
    consumer_key: WOO_CONSUMER_KEY,
    consumer_secret: WOO_CONSUMER_SECRET,
  });
  const url = `${API_BASE_URL}/wc/v3/products?${params.toString()}`;
  return fetchApiData<WooCommerceProduct>(url, 'Failed to fetch products');
};

// Fetch all published WordPress posts
const getPosts = () => {
  const url = `${API_BASE_URL}/wp/v2/posts?per_page=100&status=publish&_fields=slug,date`;
  return fetchApiData<WordPressPost>(url, 'Failed to fetch posts');
};

// Fetch all WordPress categories
const getCategories = () => {
  const url = `${API_BASE_URL}/wp/v2/categories?per_page=100&_fields=slug,id`;
  return fetchApiData<WordPressCategory>(url, 'Failed to fetch categories');
};

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
  const [products, posts, categories] = await Promise.all([
    getProducts(),
    getPosts(),
    getCategories(),
  ]);

  const productUrls = products.map((product) => ({
    url: `${siteUrl}/produkt/${product.slug}`,
    lastModified: new Date(product.date_modified),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const postUrls = posts.map((post) => ({
    url: `${siteUrl}/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${siteUrl}/blog/kategoria/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...ingredientRoutes,
    ...productUrls,
    ...postUrls,
    ...categoryUrls,
  ];
} 