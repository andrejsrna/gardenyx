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
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taxonomy = searchParams.get('taxonomy');
  const include = searchParams.get('include');
  
  try {
    console.log('Fetching products...');
    
    // Build query parameters
    const queryParams: {
      per_page: number;
      status: string;
      category?: string;
      include?: string;
    } = {
      per_page: 100,
      status: 'publish'
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
      console.error('WooCommerce API error details:', wcError.response?.data);
      
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