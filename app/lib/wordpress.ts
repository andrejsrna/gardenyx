import type {
  CheckoutFormData,
  PaginatedPosts,
  PaymentGateway,
  RankMathSEOResponse,
  ShippingMethod,
  WooCommerceOrder,
  WooCommerceProduct,
  WordPressCategory,
  WordPressMedia,
  WordPressPost,
  WordPressTag,
} from './wordpress-types';

import {
  filterLocalPosts,
  getLocalCategories as getAllLocalCategories,
  getLocalCategoryBySlug,
  getLocalPostById,
  getLocalPostBySlug,
  getLocalPosts as getAllLocalPosts,
  getLocalTags as getAllLocalTags,
  getLocalTagBySlug,
  isLocalCategoryId,
  isLocalPostId,
  isLocalTagId,
} from './local-posts';

export type {
  CheckoutFormData,
  PaginatedPosts,
  PaymentGateway,
  RankMathSEOResponse,
  ShippingMethod,
  WooCommerceOrder,
  WooCommerceProduct,
  WordPressCategory,
  WordPressMedia,
  WordPressPost,
  WordPressTag,
} from './wordpress-types';

interface GetPaginatedPostsOptions {
  page?: number;
  search?: string;
  tags?: number;
  category?: number;
}

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk';
const WORDPRESS_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;
const WOOCOMMERCE_API_URL = `${WORDPRESS_URL}/wp-json/wc/v3`;
const POSTS_PER_PAGE = 9;
const CACHE_DURATION = 86400;

const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY || '';
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET || '';

const createFetchOptions = (revalidate: number = CACHE_DURATION) => ({
  next: { revalidate }
});

const handleApiResponse = async <T>(response: Response, errorMessage: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status}`);
  }
  return response.json();
};

const logError = (context: string, error: unknown): void => {
  console.error(`Error in ${context}:`, error);
};

const sortPostsByDateDesc = (a: WordPressPost, b: WordPressPost): number =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

const mergeUniquePosts = (...groups: WordPressPost[][]): WordPressPost[] => {
  const seen = new Set<string>();
  const merged: WordPressPost[] = [];

  groups.forEach((group) => {
    group.forEach((post) => {
      const key = post.slug || String(post.id);
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(post);
    });
  });

  return merged;
};

const mergeAndSortPosts = (...groups: WordPressPost[][]): WordPressPost[] =>
  mergeUniquePosts(...groups).sort(sortPostsByDateDesc);

const sliceForPage = (posts: WordPressPost[], page: number, perPage: number): WordPressPost[] => {
  const start = (page - 1) * perPage;
  return posts.slice(start, start + perPage);
};

const getCategoryIdsFromPost = (post: WordPressPost): number[] =>
  post._embedded?.['wp:term']?.[0]?.map((category) => category.id) ?? [];

const getTagIdsFromPost = (post: WordPressPost): number[] =>
  (post._embedded?.['wp:term']?.slice(1).flat() ?? []).map((term) => term.id);

export const getWooCommerceUrl = (endpoint: string, queryParams: Record<string, string | number> = {}): string => {
  const params = new URLSearchParams();
  
  params.append('consumer_key', WOO_CONSUMER_KEY);
  params.append('consumer_secret', WOO_CONSUMER_SECRET);
  
  Object.entries(queryParams).forEach(([key, value]) => {
    params.append(key, value.toString());
  });

  return `${WOOCOMMERCE_API_URL}/${endpoint}?${params.toString()}`;
};

const buildWordPressUrl = (endpoint: string, params: Record<string, string | number> = {}): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });
  
  const queryString = searchParams.toString();
  return `${WORDPRESS_API_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;
};

const shouldFetchWordPressPosts = (category?: number, tags?: number): boolean => {
  const categoryIsLocal = typeof category === 'number' && isLocalCategoryId(category);
  const tagIsLocal = typeof tags === 'number' && isLocalTagId(tags);
  return !categoryIsLocal && !tagIsLocal;
};

const collectStandardWordPressPosts = async (
  options: GetPaginatedPostsOptions,
  perPage: number,
): Promise<{ posts: WordPressPost[]; totalPosts: number; totalPages: number; }> => {
  const { page = 1, tags, category } = options;

  const params: Record<string, string | number> = {
    _embed: '',
    per_page: perPage,
    orderby: 'date',
    order: 'desc',
  };

  if (tags && !isLocalTagId(tags)) {
    params.tags = tags;
  }
  if (category && !isLocalCategoryId(category)) {
    params.categories = category;
  }

  const aggregated: WordPressPost[] = [];
  let totalPosts = 0;
  let totalPages = 0;

  for (let currentPage = 1; currentPage <= page; currentPage += 1) {
    params.page = currentPage;
    const url = buildWordPressUrl('posts', params);
    const response = await fetch(url, createFetchOptions());

    if (!response.ok) {
      if (response.status === 400) {
        break;
      }
      throw new Error(`Failed to fetch paginated posts: ${response.status}`);
    }

    const pagePosts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch paginated posts');
    aggregated.push(...pagePosts);

    if (currentPage === 1) {
      totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
      totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);
    }

    if (currentPage >= totalPages) {
      break;
    }
  }

  return { posts: aggregated, totalPosts, totalPages };
};

const collectSearchWordPressPosts = async (
  options: GetPaginatedPostsOptions,
  perPage: number,
): Promise<{ posts: WordPressPost[]; totalPosts: number; totalPages: number; }> => {
  const { search = '', page = 1, tags, category } = options;

  if (!search) {
    return { posts: [], totalPosts: 0, totalPages: 0 };
  }

  const aggregated: WordPressPost[] = [];
  let totalPosts = 0;
  let totalPages = 0;

  for (let currentPage = 1; currentPage <= page; currentPage += 1) {
    const params = new URLSearchParams();
    params.append('s', search);
    params.append('per_page', perPage.toString());
    params.append('page', currentPage.toString());
    params.append('_embed', 'true');

    if (tags && !isLocalTagId(tags)) {
      params.append('tags', tags.toString());
    }
    if (category && !isLocalCategoryId(category)) {
      params.append('categories', category.toString());
    }

    const url = `${WORDPRESS_URL}/wp-json/relevanssi/v1/search?${params.toString()}`;
    const response = await fetch(url, createFetchOptions());

    if (!response.ok) {
      if (response.status === 400) {
        break;
      }
      throw new Error(`Failed to fetch search results from Relevanssi: ${response.status}`);
    }

    const pagePosts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch search results from Relevanssi');
    aggregated.push(...pagePosts);

    if (currentPage === 1) {
      totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
      totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);
    }

    if (currentPage >= totalPages) {
      break;
    }
  }

  return { posts: aggregated, totalPosts, totalPages };
};

const collectWordPressPosts = async (
  options: GetPaginatedPostsOptions,
  perPage: number,
): Promise<{ posts: WordPressPost[]; totalPosts: number; totalPages: number; }> => {
  if (options.search) {
    return collectSearchWordPressPosts(options, perPage);
  }
  return collectStandardWordPressPosts(options, perPage);
};

export const getLatestPosts = async (count: number = 3): Promise<WordPressPost[]> => {
  try {
    const localPosts = (await getAllLocalPosts()).slice(0, count * 2);

    const url = buildWordPressUrl('posts', {
      _embed: '',
      per_page: Math.max(count, POSTS_PER_PAGE),
      orderby: 'date',
      order: 'desc'
    });
    
    const response = await fetch(url, createFetchOptions());
    const wordpressPosts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch latest posts');

    return mergeAndSortPosts(localPosts, wordpressPosts).slice(0, count);
  } catch (error) {
    logError('getLatestPosts', error);
    return (await getAllLocalPosts()).slice(0, count);
  }
};

export const getPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  try {
    const localPost = await getLocalPostBySlug(slug);
    if (localPost) {
      return localPost;
    }

    const url = buildWordPressUrl('posts', {
      _embed: '',
      slug
    });
    
    const response = await fetch(url, createFetchOptions());
    const posts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch post by slug');
    
    return posts[0] || null;
  } catch (error) {
    logError(`getPostBySlug(${slug})`, error);
    return null;
  }
};

export const getPaginatedPosts = async ({
  page = 1,
  search = '',
  tags,
  category,
}: GetPaginatedPostsOptions = {}): Promise<PaginatedPosts> => {
  try {
    const perPage = POSTS_PER_PAGE;
    const includeLocal =
      (!category || isLocalCategoryId(category)) &&
      (!tags || isLocalTagId(tags));

    const localPosts = includeLocal
      ? await filterLocalPosts({
          search,
          categoryId: category && isLocalCategoryId(category) ? category : undefined,
          tagId: tags && isLocalTagId(tags) ? tags : undefined,
        })
      : [];

    let wordpressPosts: WordPressPost[] = [];
    let wordpressTotalPosts = 0;
    let wordpressTotalPages = 0;

    if (shouldFetchWordPressPosts(category, tags)) {
      const wpOptions: GetPaginatedPostsOptions = {
        page,
        search,
        tags: tags && !isLocalTagId(tags) ? tags : undefined,
        category: category && !isLocalCategoryId(category) ? category : undefined,
      };

      const results = await collectWordPressPosts(wpOptions, perPage);
      wordpressPosts = results.posts;
      wordpressTotalPosts = results.totalPosts;
      wordpressTotalPages = results.totalPages;
    }

    const combinedTotalPosts = wordpressTotalPosts + localPosts.length;
    const combinedTotalPages = combinedTotalPosts === 0 ? 0 : Math.ceil(combinedTotalPosts / perPage);

    const combinedPosts = mergeAndSortPosts(localPosts, wordpressPosts);
    const paginatedPosts = sliceForPage(combinedPosts, page, perPage);

    return {
      posts: paginatedPosts,
      totalPages: combinedTotalPages,
      totalPosts: combinedTotalPosts,
    };
  } catch (error) {
    logError('getPaginatedPosts', error);
    const fallbackLocal = await filterLocalPosts({
      search,
      categoryId: category && isLocalCategoryId(category) ? category : undefined,
      tagId: tags && isLocalTagId(tags) ? tags : undefined,
    });
    return {
      posts: sliceForPage(fallbackLocal, page, POSTS_PER_PAGE),
      totalPages: fallbackLocal.length === 0 ? 0 : Math.ceil(fallbackLocal.length / POSTS_PER_PAGE),
      totalPosts: fallbackLocal.length,
    };
  }
};

export const getProductsByCategory = async (categorySlug: string, limit: number = 4): Promise<WooCommerceProduct[]> => {
  try {
    const categoryUrl = getWooCommerceUrl('products/categories', { slug: categorySlug });
    const categoryResponse = await fetch(categoryUrl);
    
    const categories = await handleApiResponse<Array<{ id: number }>>(categoryResponse, 'Failed to fetch category');
    
    if (!categories.length) return [];

    const productsUrl = getWooCommerceUrl('products', {
      category: categories[0].id,
      per_page: limit,
      orderby: 'date',
      order: 'desc',
      status: 'publish'
    });

    const productsResponse = await fetch(productsUrl);
    return await handleApiResponse<WooCommerceProduct[]>(productsResponse, 'Failed to fetch products by category');
  } catch (error) {
    logError(`getProductsByCategory(${categorySlug})`, error);
    return [];
  }
};

export const createOrder = async (orderData: CheckoutFormData) => {
  try {
    const response = await fetch('/api/woocommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  } catch (error) {
    logError('createOrder', error);
    throw error;
  }
};

const fetchApiData = async <T>(endpoint: string, errorMessage: string): Promise<T> => {
  try {
    const response = await fetch(endpoint);
    return await handleApiResponse<T>(response, errorMessage);
  } catch (error) {
    logError(`fetchApiData(${endpoint})`, error);
    return [] as T;
  }
};

export const getShippingMethods = (): Promise<ShippingMethod[]> =>
  fetchApiData<ShippingMethod[]>('/api/woocommerce/shipping-methods', 'Failed to fetch shipping methods');

export const getPaymentGateways = (): Promise<PaymentGateway[]> =>
  fetchApiData<PaymentGateway[]>('/api/woocommerce/payment-gateways', 'Failed to fetch payment gateways');

export const getProductsByIds = async (ids: number[]): Promise<WooCommerceProduct[]> => {
  try {
    const productsUrl = getWooCommerceUrl('products', {
      include: ids.join(','),
      status: 'publish'
    });

    const response = await fetch(productsUrl);
    return await handleApiResponse<WooCommerceProduct[]>(response, 'Failed to fetch products by IDs');
  } catch (error) {
    logError(`getProductsByIds([${ids.join(',')}])`, error);
    return [];
  }
};

export const getRankMathSEO = async (url: string): Promise<RankMathSEOResponse | null> => {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/rankmath/v1/getHead?url=${url}`,
      createFetchOptions()
    );

    return await handleApiResponse<RankMathSEOResponse>(response, 'Failed to fetch RankMath SEO data');
  } catch (error) {
    logError(`getRankMathSEO(${url})`, error);
    return null;
  }
};

export const getTagBySlug = async (slug: string): Promise<WordPressTag | null> => {
  try {
    const localTag = await getLocalTagBySlug(slug);
    if (localTag) {
      return localTag;
    }

    const url = buildWordPressUrl('tags', { slug });
    const response = await fetch(url, createFetchOptions());
    
    const tags = await handleApiResponse<WordPressTag[]>(response, `Failed to fetch tag with slug: ${slug}`);
    
    if (tags.length > 0) {
      return tags[0];
    }
    
    console.warn(`No tag found with slug: ${slug}`);
    return null;
  } catch (error) {
    logError(`getTagBySlug(${slug})`, error);
    return null;
  }
};

export const getAllTags = async (): Promise<WordPressTag[]> => {
  try {
    const [localTags, wordpressResponse] = await Promise.all([
      getAllLocalTags(),
      fetch(
        buildWordPressUrl('tags', {
          per_page: 100,
          orderby: 'count',
          order: 'desc',
          hide_empty: 'true',
        }),
        createFetchOptions(),
      ),
    ]);

    let wordpressTags: WordPressTag[] = [];
    if (wordpressResponse.ok) {
      wordpressTags = await handleApiResponse<WordPressTag[]>(wordpressResponse, 'Failed to fetch tags');
    } else if (wordpressResponse.status !== 404) {
      throw new Error(`Failed to fetch tags: ${wordpressResponse.status}`);
    }

    const merged = new Map<string, WordPressTag>();
    localTags.forEach((tag) => merged.set(tag.slug, tag));

    wordpressTags.forEach((tag) => {
      const existing = merged.get(tag.slug);
      if (existing) {
        merged.set(tag.slug, { ...existing, count: existing.count + tag.count });
      } else {
        merged.set(tag.slug, tag);
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    logError('getAllTags', error);
    return getAllLocalTags();
  }
};

export const getCategories = async (): Promise<WordPressCategory[]> => {
  try {
    const [localCategories, wordpressResponse] = await Promise.all([
      getAllLocalCategories(),
      fetch(
        buildWordPressUrl('categories', {
          per_page: 100,
          orderby: 'count',
          order: 'desc',
          hide_empty: 'true',
        }),
        createFetchOptions(),
      ),
    ]);

    let wordpressCategories: WordPressCategory[] = [];
    if (wordpressResponse.ok) {
      wordpressCategories = await handleApiResponse<WordPressCategory[]>(wordpressResponse, 'Failed to fetch categories');
    } else if (wordpressResponse.status !== 404) {
      throw new Error(`Failed to fetch categories: ${wordpressResponse.status}`);
    }

    const merged = new Map<string, WordPressCategory>();
    localCategories.forEach((category) => merged.set(category.slug, category));

    wordpressCategories.forEach((category) => {
      if (!merged.has(category.slug)) {
        merged.set(category.slug, category);
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    logError('getCategories', error);
    return getAllLocalCategories();
  }
};

// Get related posts based on current post categories or tags
export const getRelatedPosts = async (
  currentPostId: number, 
  limit: number = 6,
  categories?: number[],
  tags?: number[]
): Promise<WordPressPost[]> => {
  try {
    const localPosts = await getAllLocalPosts();
    const currentLocalPost = isLocalPostId(currentPostId)
      ? localPosts.find((post) => post.id === currentPostId) ?? null
      : null;

    const requestedLocalCategoryIds = (categories ?? []).filter(isLocalCategoryId);
    const requestedLocalTagIds = (tags ?? []).filter(isLocalTagId);
    const requestedWordPressCategoryIds = (categories ?? []).filter((id) => !isLocalCategoryId(id));
    const requestedWordPressTagIds = (tags ?? []).filter((id) => !isLocalTagId(id));

    const effectiveLocalCategoryIds =
      requestedLocalCategoryIds.length > 0
        ? requestedLocalCategoryIds
        : currentLocalPost
          ? getCategoryIdsFromPost(currentLocalPost)
          : [];

    const effectiveLocalTagIds =
      requestedLocalTagIds.length > 0
        ? requestedLocalTagIds
        : currentLocalPost
          ? getTagIdsFromPost(currentLocalPost)
          : [];

    let localMatches = localPosts.filter((post) => post.id !== currentPostId);

    if (effectiveLocalCategoryIds.length > 0) {
      localMatches = localMatches.filter((post) => {
        const categoryIds = getCategoryIdsFromPost(post);
        return categoryIds.some((id) => effectiveLocalCategoryIds.includes(id));
      });
    } else if (effectiveLocalTagIds.length > 0) {
      localMatches = localMatches.filter((post) => {
        const tagIds = getTagIdsFromPost(post);
        return tagIds.some((id) => effectiveLocalTagIds.includes(id));
      });
    }

    localMatches = localMatches.slice(0, limit);

    const needAdditionalPosts = localMatches.length < limit;
    const shouldFetchWordPress =
      needAdditionalPosts ||
      !isLocalPostId(currentPostId) ||
      requestedWordPressCategoryIds.length > 0 ||
      requestedWordPressTagIds.length > 0;

    let wordpressMatches: WordPressPost[] = [];

    if (shouldFetchWordPress) {
      const params: Record<string, string | number> = {
        _embed: '',
        per_page: limit + Math.max(1, limit - localMatches.length) + 1,
        orderby: 'date',
        order: 'desc',
      };

      if (!isLocalPostId(currentPostId)) {
        params.exclude = currentPostId;
      }

      if (requestedWordPressCategoryIds.length > 0) {
        params.categories = requestedWordPressCategoryIds.join(',');
      } else if (requestedWordPressTagIds.length > 0) {
        params.tags = requestedWordPressTagIds.join(',');
      }

      const url = buildWordPressUrl('posts', params);
      const response = await fetch(url, createFetchOptions(1800));

      if (response.ok) {
        wordpressMatches = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch related posts');
      }
    }

    const combined = mergeAndSortPosts(
      localMatches,
      wordpressMatches.filter((post) => post.id !== currentPostId),
    );

    return combined.slice(0, limit);
  } catch (error) {
    logError(`getRelatedPosts(${currentPostId})`, error);
    return [];
  }
};

// Get posts by category slug  
export const getPostsByCategory = async (
  categorySlug: string,
  limit: number = 6,
  excludePostId?: number
): Promise<WordPressPost[]> => {
  const localCategory = await getLocalCategoryBySlug(categorySlug);
  const localPosts = localCategory
    ? (await filterLocalPosts({ categoryId: localCategory.id }))
        .filter((post) => post.id !== excludePostId)
        .slice(0, limit)
    : [];

  try {
    let wordpressPosts: WordPressPost[] = [];

    const categoryResponse = await fetch(
      buildWordPressUrl('categories', { slug: categorySlug }),
      createFetchOptions(),
    );

    let wordpressCategoryId: number | null = null;

    if (categoryResponse.ok) {
      const categories = await handleApiResponse<Array<{ id: number }>>(
        categoryResponse,
        'Failed to fetch category',
      );
      wordpressCategoryId = categories[0]?.id ?? null;
    } else if (categoryResponse.status !== 404) {
      throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
    }

    if (wordpressCategoryId) {
      const params: Record<string, string | number> = {
        _embed: '',
        per_page: limit + Math.max(0, limit - localPosts.length),
        categories: wordpressCategoryId,
        orderby: 'date',
        order: 'desc',
      };

      if (excludePostId) {
        params.exclude = excludePostId;
      }

      const response = await fetch(buildWordPressUrl('posts', params), createFetchOptions(1800));

      if (response.ok) {
        wordpressPosts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch posts by category');
      }
    }

    const combined = mergeAndSortPosts(
      localPosts,
      wordpressPosts.filter((post) => post.id !== excludePostId),
    );

    return combined.slice(0, limit);
  } catch (error) {
    logError(`getPostsByCategory(${categorySlug})`, error);
    return localPosts;
  }
};

// Get popular posts (by comment count or custom meta)
export const getPopularPosts = async (limit: number = 6): Promise<WordPressPost[]> => {
  const localPosts = (await getAllLocalPosts()).slice(0, limit);

  try {
    const url = buildWordPressUrl('posts', {
      _embed: '',
      per_page: limit,
      orderby: 'comment_count',
      order: 'desc'
    });
    
    const response = await fetch(url, createFetchOptions(3600)); // Cache for 1 hour
    const wordpressPosts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch popular posts');

    return mergeUniquePosts(wordpressPosts, localPosts).slice(0, limit);
  } catch (error) {
    logError('getPopularPosts', error);
    return localPosts;
  }
};

// Enhanced function to get posts with categories and tags data
export const getPostWithMetadata = async (slug: string): Promise<WordPressPost | null> => {
  try {
    const localPost = await getLocalPostBySlug(slug);
    if (localPost) {
      return localPost;
    }

    const url = buildWordPressUrl('posts', {
      _embed: '',
      slug
    });
    
    const response = await fetch(url, createFetchOptions());
    const posts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch post with metadata');
    
    return posts[0] || null;
  } catch (error) {
    logError(`getPostWithMetadata(${slug})`, error);
    return null;
  }
};

export const getCategoryBySlug = async (slug: string): Promise<WordPressCategory | null> => {
  try {
    const localCategory = await getLocalCategoryBySlug(slug);
    if (localCategory) {
      return localCategory;
    }

    const url = buildWordPressUrl('categories', { slug });
    const response = await fetch(url, createFetchOptions());
    const categories = await handleApiResponse<WordPressCategory[]>(response, 'Failed to fetch category by slug');
    return categories[0] || null;
  } catch (error) {
    logError(`getCategoryBySlug(${slug})`, error);
    return null;
  }
};

export interface WooCommerceProductCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export const getProductCategories = async (): Promise<WooCommerceProductCategory[]> => {
  try {
    const url = getWooCommerceUrl('products/categories', { per_page: 100 });
    const response = await fetch(url, createFetchOptions());
    return await handleApiResponse<WooCommerceProductCategory[]>(response, 'Failed to fetch product categories');
  } catch (error) {
    logError('getProductCategories', error);
    return [];
  }
};

export const getMediaDetails = async (id: number): Promise<WordPressMedia | null> => {
  if (!id) return null;
  
  try {
    const url = buildWordPressUrl(`media/${id}`);
    const response = await fetch(url, createFetchOptions());
    return await handleApiResponse<WordPressMedia>(response, `Failed to fetch media details for ID ${id}`);
  } catch (error) {
    logError(`getMediaDetails(${id})`, error);
    return null;
  }
};
