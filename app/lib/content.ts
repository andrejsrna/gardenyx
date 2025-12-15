import type {
  PaginatedPosts,
  RankMathSEOResponse,
  WordPressCategory,
  WordPressPost,
  WordPressTag,
  Product,
  BlogPost,
} from './content-types';
import type { LocalProduct } from './products';
import { getAllProducts } from './products';
import {
  getLocalPosts,
  getLocalPostBySlug,
  getLocalTags,
  getLocalTagBySlug,
  getLocalCategories,
  getLocalCategoryBySlug,
} from './local-posts';


const POSTS_PER_PAGE = 9;

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const getRankMathSEO = async (): Promise<RankMathSEOResponse | null> => {
  return null; // RankMath disabled; we rely on local SEO defaults
};

export const getPaginatedPosts = async (options: { page?: number; search?: string; tags?: number; category?: number; }): Promise<PaginatedPosts> => {
  const page = Math.max(1, options.page || 1);
  const search = options.search?.toLowerCase().trim() || '';
  const tagId = options.tags;
  const categoryId = options.category;

  const allPosts = await getLocalPosts();

  const filtered = allPosts.filter((post) => {
    if (tagId) {
      const tagIds = post._embedded?.['wp:term']?.[1]?.map((t) => t.id) || [];
      if (!tagIds.includes(tagId)) return false;
    }
    if (categoryId) {
      const catIds = post._embedded?.['wp:term']?.[0]?.map((c) => c.id) || [];
      if (!catIds.includes(categoryId)) return false;
    }
    if (search) {
      const haystack = `${post.title.rendered} ${stripHtml(post.excerpt.rendered)} ${stripHtml(post.content.rendered)}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const totalPosts = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = filtered.slice(start, start + POSTS_PER_PAGE);

  return { posts, totalPages, totalPosts };
};

export const getPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  return getLocalPostBySlug(slug);
};

export const getAllTags = async (): Promise<WordPressTag[]> => getLocalTags();
export const getTagBySlug = async (slug: string): Promise<WordPressTag | null> => getLocalTagBySlug(slug);
export const getCategories = async (): Promise<WordPressCategory[]> => getLocalCategories();
export const getCategoryBySlug = async (slug: string): Promise<WordPressCategory | null> => getLocalCategoryBySlug(slug);

// Product helpers (local markdown) kept for compatibility with old Woo imports
export type ProductType = Product;
export type WooCommerceProduct = Product;
export const getProductsByIds = async (ids: number[]): Promise<LocalProduct[]> => getAllProducts().then(p => p.filter(prod => ids.includes(prod.id)));
export const getProductsByCategory = async (_categorySlug: string, limit: number = 4): Promise<LocalProduct[]> => {
  const all = await getAllProducts();
  return all.slice(0, limit);
};
export const getWooCommerceUrl = (endpoint: string) => `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/${endpoint}`;

// Blog helper shims
export const getLatestPosts = async (limit = 5): Promise<BlogPost[]> => {
  const posts = await getLocalPosts();
  return posts.slice(0, limit);
};
export const getPopularPosts = getLatestPosts;
export const getPostsByCategory = async (_categorySlug: string, limit = 5): Promise<BlogPost[]> => {
  const posts = await getLocalPosts();
  return posts.slice(0, limit);
};
export const getRelatedPosts = async (_slug: string, limit = 3): Promise<BlogPost[]> => {
  const posts = await getLocalPosts();
  return posts.slice(0, limit);
};
export const getMediaDetails = async (id: number) => {
  void id;
  return null;
};

// Legacy exports for compatibility
export type {
  PaginatedPosts,
  RankMathSEOResponse,
  WordPressCategory,
  WordPressPost,
  WordPressTag,
  Product,
  BlogPost,
  BlogCategory,
  BlogTag
} from './content-types';
