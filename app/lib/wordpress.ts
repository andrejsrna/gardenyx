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

export interface CheckoutFormData {
  status?: string;
  currency?: string;
  customer_note?: string;
  billing: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
    ic?: string;
    dic?: string;
    dic_dph?: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
  };
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
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping_method: string;
  payment_method: string;
}

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://najsilnejsiaklbovavyziva.sk';
const WORDPRESS_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;
const WOOCOMMERCE_API_URL = `${WORDPRESS_URL}/wp-json/wc/v3`;
const POSTS_PER_PAGE = 9;

// WooCommerce authentication credentials
const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY || '';
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET || '';

// Helper function to create authenticated WooCommerce URL
export function getWooCommerceUrl(endpoint: string, queryParams: Record<string, string | number> = {}) {
  const params = new URLSearchParams();
  
  // Add authentication parameters
  params.append('consumer_key', WOO_CONSUMER_KEY);
  params.append('consumer_secret', WOO_CONSUMER_SECRET);
  
  // Add additional query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    params.append(key, value.toString());
  });

  return `${WOOCOMMERCE_API_URL}/${endpoint}?${params.toString()}`;
}

export async function getLatestPosts(count: number = 3): Promise<WordPressPost[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed&per_page=${count}&orderby=date&order=desc`,
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const posts: WordPressPost[] = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed&slug=${slug}`,
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    const posts: WordPressPost[] = await response.json();
    return posts[0] || null;
  } catch (error) {
    console.error('Error fetching WordPress post:', error);
    return null;
  }
}

export interface PaginatedPosts {
  posts: WordPressPost[];
  totalPages: number;
  totalPosts: number;
}

interface GetPaginatedPostsOptions {
  page?: number;
  search?: string;
}

export async function getPaginatedPosts({ 
  page = 1, 
  search = '' 
}: GetPaginatedPostsOptions = {}): Promise<PaginatedPosts> {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed&per_page=${POSTS_PER_PAGE}&page=${page}&orderby=date&order=desc${searchParam}`,
      {
        next: {
          // Cache for 1 hour
          revalidate: 3600,
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const posts: WordPressPost[] = await response.json();
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

    return {
      posts,
      totalPages,
      totalPosts,
    };
  } catch (error) {
    console.error('Error fetching paginated posts:', error);
    return {
      posts: [],
      totalPages: 0,
      totalPosts: 0,
    };
  }
}

export async function getProductsByCategory(categorySlug: string, limit: number = 4): Promise<WooCommerceProduct[]> {
  try {
    // First, get the category ID by slug
    const categoryUrl = getWooCommerceUrl('products/categories', { slug: categorySlug });
    const categoryResponse = await fetch(categoryUrl);

    if (!categoryResponse.ok) {
      throw new Error('Failed to fetch category');
    }

    const categories = await categoryResponse.json();
    if (!categories.length) {
      return [];
    }

    const categoryId = categories[0].id;

    // Then fetch products from that category
    const productsUrl = getWooCommerceUrl('products', {
      category: categoryId,
      per_page: limit,
      orderby: 'date',
      order: 'desc',
      status: 'publish'
    });
    
    const productsResponse = await fetch(productsUrl);

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const products: WooCommerceProduct[] = await productsResponse.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function createOrder(orderData: CheckoutFormData) {
  try {
    const response = await fetch('/api/woocommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  try {
    const response = await fetch('/api/woocommerce/shipping-methods');
    if (!response.ok) {
      throw new Error('Failed to fetch shipping methods');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }
}

export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  try {
    const response = await fetch('/api/woocommerce/payment-gateways');
    if (!response.ok) {
      throw new Error('Failed to fetch payment gateways');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return [];
  }
}

export async function getProductsByIds(ids: number[]): Promise<WooCommerceProduct[]> {
  try {
    const productsUrl = getWooCommerceUrl('products', {
      include: ids.join(','),
      status: 'publish'
    });
    
    const productsResponse = await fetch(productsUrl);

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const products: WooCommerceProduct[] = await productsResponse.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Add this function to fetch RankMath SEO data
export async function getRankMathSEO(url: string) {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/rankmath/v1/getHead?url=${url}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch RankMath SEO data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching RankMath SEO data:', error);
    return null;
  }
} 