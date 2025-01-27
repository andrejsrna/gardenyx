import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taxonomy = searchParams.get('taxonomy');
  const include = searchParams.get('include');
  
  // Build WooCommerce API parameters
  const apiParams = new URLSearchParams();
  apiParams.append('per_page', '100'); // Increase if you need more products
  apiParams.append('status', 'publish'); // Only get published products
  
  if (taxonomy) {
    // Use category ID directly
    apiParams.append('category', taxonomy);
  }

  if (include) {
    // Add specific product IDs to include
    apiParams.append('include', include);
  }

  const apiUrl = `${process.env.WORDPRESS_URL}/wp-json/wc/v3/products?${apiParams.toString()}`;

  try {
    console.log('Fetching products from:', apiUrl);
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString('base64')}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('WooCommerce API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as WooCommerceProduct[];
    console.log(`Fetched ${data.length} products for ${taxonomy ? `category ${taxonomy}` : 'include list'}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 