import { getCategories } from '@/app/lib/wordpress';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
} 