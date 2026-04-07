import { NextResponse } from 'next/server';
import { getAllProducts, getProductsByIds, getProductBySlug } from '@/app/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  if (!request.url) {
    return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const include = searchParams.get('include');
  const slug = searchParams.get('slug');
  const locale = searchParams.get('locale') || undefined;

  try {
    if (slug) {
      const product = await getProductBySlug(slug, locale);
      if (!product) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    if (include) {
      const ids = include.split(',').map(id => Number(id.trim())).filter(id => Number.isFinite(id));
      const products = await getProductsByIds(ids, locale);
      return NextResponse.json(products);
    }

    const products = await getAllProducts(locale);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error reading local products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
