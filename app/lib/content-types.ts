export interface RankMathSEOResponse {
  head: string;
}

export type Product = import('./products').LocalProduct;

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
    'author': [{ name: string; }];
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    'wp:term'?: WordPressCategory[][];
  };
  meta?: {
    isLocal?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoImage?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    updated?: string;
    readingTimeMinutes?: number;
  };
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

export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: Array<{ key: string; value: unknown; }>;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
}

export interface PaginatedPosts {
  posts: WordPressPost[];
  totalPages: number;
  totalPosts: number;
}

export type BlogPost = WordPressPost;
export type BlogCategory = WordPressCategory;
export type BlogTag = WordPressTag;
