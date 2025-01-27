import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
}

interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  categories: WooCommerceCategory[];
}

interface WooCommerceError extends Error {
  response?: {
    status: number;
    data: {
      message?: string;
      [key: string]: unknown;
    };
  };
}

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY!,
  consumerSecret: process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET!,
  version: 'wc/v3',
  queryStringAuth: true // Force query string authentication
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taxonomy = searchParams.get('taxonomy');
  const include = searchParams.get('include');
  
  try {
    // Debug log credentials (don't log in production)
    console.log('API Configuration:', {
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL,
      hasConsumerKey: !!process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY,
      hasConsumerSecret: !!process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET
    });
    
    console.log('Fetching products...');
    
    // Build query parameters
    const queryParams: {
      per_page: number;
      status: string;
      category?: string;
      include?: string;
      consumer_key?: string;
      consumer_secret?: string;
    } = {
      per_page: 100,
      status: 'publish',
      consumer_key: process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY!,
      consumer_secret: process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET!
    };

    if (taxonomy) {
      queryParams.category = taxonomy;
    }

    if (include) {
      queryParams.include = include;
    }

    // Fetch products using WooCommerce REST API client
    const response = await api.get('products', queryParams);
    const data = response.data as WooCommerceProduct[];
    console.log(`Fetched ${data.length} products for ${taxonomy ? `category ${taxonomy}` : 'include list'}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Check if it's a WooCommerce API error
    if (error instanceof Error && 'response' in error) {
      const wcError = error as WooCommerceError;
      console.error('WooCommerce API error details:', {
        status: wcError.response?.status,
        data: wcError.response?.data,
        message: wcError.message
      });
      
      return NextResponse.json(
        { message: wcError.response?.data?.message || 'Failed to fetch products' },
        { status: wcError.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 