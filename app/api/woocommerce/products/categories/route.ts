import { NextResponse } from 'next/server';
import { getProductCategories, WooCommerceProductCategory } from '@/app/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const productCategories: WooCommerceProductCategory[] = await getProductCategories();
    return NextResponse.json(productCategories);
  } catch (error) {
    console.error('Error fetching product categories:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch product categories', error: message }, { status: 500 });
  }
} 