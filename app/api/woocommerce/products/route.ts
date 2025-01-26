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
  
  // Build WooCommerce API parameters
  const apiParams = new URLSearchParams();
  apiParams.append('per_page', '100'); // Increase if you need more products
  
  if (taxonomy) {
    // Use category ID directly
    apiParams.append('category', taxonomy);
  }

  const apiUrl = `${process.env.WORDPRESS_URL}/wp-json/wc/v3/products?${apiParams.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json() as WooCommerceProduct[];
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error },
      { status: 500 }
    );
  }
} 