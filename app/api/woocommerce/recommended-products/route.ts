import { NextResponse } from 'next/server';
import { getWooCommerceUrl } from '../../../lib/wordpress';

export async function GET(request: Request) {
  try {
    if (!request.url) {
      return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    const productsUrl = getWooCommerceUrl('products', {
      include: ids,
      status: 'publish'
    });
    
    const productsResponse = await fetch(productsUrl);

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const products = await productsResponse.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended products' },
      { status: 500 }
    );
  }
} 