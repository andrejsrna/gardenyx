import { MetadataRoute } from 'next';
import { WooCommerceProduct, WordPressPost, getWooCommerceUrl, getCategories } from './lib/wordpress';

const BASE_URL = 'https://najsilnejsiaklbovavyziva.sk';
const WORDPRESS_API_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk'}/wp-json/wp/v2`;

const STATIC_ROUTES = [
  { url: '', changeFrequency: 'daily', priority: 1 },
  { url: '/kupit', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/zlozenie', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/obchodne-podmienky', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/ochrana-osobnych-udajov', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/doprava-a-platba', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/uzivanie', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/casto-kladene-otazky', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/kontakt', changeFrequency: 'monthly', priority: 0.5 },
  { url: '/registracia', changeFrequency: 'yearly', priority: 0.4 },
  { url: '/reklamacie', changeFrequency: 'yearly', priority: 0.4 },
  { url: '/moj-ucet', changeFrequency: 'yearly', priority: 0.4 },
] as const;

const INGREDIENT_ROUTES: string[] = [
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

const createSitemapEntry = (path: string, options: Partial<MetadataRoute.Sitemap[0]> = {}): MetadataRoute.Sitemap[0] => ({
  url: `${BASE_URL}${path}`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.7,
  ...options,
});


async function fetchFromApi<T>(url: string, errorMessage: string): Promise<T[]> {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching for sitemap (${url}):`, error);
    return [];
  }
}

const getProducts = () => fetchFromApi<WooCommerceProduct>(getWooCommerceUrl('products', { per_page: '100', status: 'publish' }), 'Failed to fetch products');
const getBlogPosts = () => fetchFromApi<WordPressPost>(`${WORDPRESS_API_URL}/posts?_fields=slug,date&per_page=100&status=publish`, 'Failed to fetch posts');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories] = await Promise.all([
    getProducts(),
    getBlogPosts(),
    getCategories(),
  ]);

  const staticUrls = STATIC_ROUTES.map(route => createSitemapEntry(route.url, route));
  const ingredientUrls = INGREDIENT_ROUTES.map(route => createSitemapEntry(route));

  const productUrls = products.map((product) => createSitemapEntry(`/produkt/${product.slug}`, {
    lastModified: new Date(product.date_modified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogPostUrls = posts.map((post) => createSitemapEntry(`/${post.slug}`, {
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const categoryUrls = categories.map((category) => createSitemapEntry(`/blog/kategoria/${category.slug}`, {
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticUrls,
    ...ingredientUrls,
    ...productUrls,
    ...blogPostUrls,
    ...categoryUrls
  ];
} 