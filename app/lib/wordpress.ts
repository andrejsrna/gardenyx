export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  slug: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  date_created: string;
  date_modified: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface ShippingMethod {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_id: string;
  method_title: string;
  settings?: {
    cost?: {
      value: string;
    };
  };
}

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_title: string;
  method_description: string;
  settings?: Record<string, unknown>;
}

interface BaseAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
}

interface BillingAddress extends BaseAddress {
  email: string;
  phone: string;
  ic?: string;
  dic?: string;
  dic_dph?: string;
}

export interface CheckoutFormData {
  status?: string;
  currency?: string;
  customer_note?: string;
  billing: BillingAddress;
  shipping: BaseAddress;
  shipping_method: string;
  payment_method: string;
  payment_method_title?: string;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_lines: Array<{
    method_id: string;
    method_title: string;
    total: string;
    meta_data?: Array<{
      key: string;
      value: string;
    }>;
  }>;
  set_paid?: boolean;
  is_business?: boolean;
}

export interface WooCommerceOrder extends Omit<CheckoutFormData, 'is_business'> {
  status: string;
  customer_id?: number;
  billing: Required<BillingAddress>;
  shipping: Required<BaseAddress>;
  shipping_method: string;
  payment_method: string;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface PaginatedPosts {
  posts: WordPressPost[];
  totalPages: number;
  totalPosts: number;
}

interface GetPaginatedPostsOptions {
  page?: number;
  search?: string;
  tags?: number;
}

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk';
const WORDPRESS_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;
const WOOCOMMERCE_API_URL = `${WORDPRESS_URL}/wp-json/wc/v3`;
const POSTS_PER_PAGE = 9;
const CACHE_DURATION = 3600;

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

export const getLatestPosts = async (count: number = 3): Promise<WordPressPost[]> => {
  try {
    const url = buildWordPressUrl('posts', {
      _embed: '',
      per_page: count,
      orderby: 'date',
      order: 'desc'
    });
    
    const response = await fetch(url, createFetchOptions());
    return await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch latest posts');
  } catch (error) {
    logError('getLatestPosts', error);
    return [];
  }
};

export const getPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  try {
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
}: GetPaginatedPostsOptions = {}): Promise<PaginatedPosts> => {
  try {
    const params: Record<string, string | number> = {
      _embed: '',
      per_page: POSTS_PER_PAGE,
      page,
      orderby: 'date',
      order: 'desc'
    };
    
    if (search) params.search = encodeURIComponent(search);
    if (tags) params.tags = tags;
    
    const url = buildWordPressUrl('posts', params);
    const response = await fetch(url, createFetchOptions());
    
    const posts = await handleApiResponse<WordPressPost[]>(response, 'Failed to fetch paginated posts');
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

    return { posts, totalPages, totalPosts };
  } catch (error) {
    logError('getPaginatedPosts', error);
    return { posts: [], totalPages: 0, totalPosts: 0 };
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

export const getRankMathSEO = async (url: string) => {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/rankmath/v1/getHead?url=${url}`,
      createFetchOptions()
    );

    return await handleApiResponse<unknown>(response, 'Failed to fetch RankMath SEO data');
  } catch (error) {
    logError(`getRankMathSEO(${url})`, error);
    return null;
  }
};

export const getTagBySlug = async (slug: string): Promise<WordPressTag | null> => {
  try {
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
    const url = buildWordPressUrl('tags', {
      per_page: 50,
      orderby: 'count',
      order: 'desc'
    });
    
    const response = await fetch(url, createFetchOptions());
    const tags = await handleApiResponse<WordPressTag[]>(response, 'Failed to fetch all tags');
    
    return tags.filter(tag => tag.count > 0);
  } catch (error) {
    logError('getAllTags', error);
    return [];
  }
};
