import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

export type LocalProduct = {
  id: number;
  wcId: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  sku?: string | null;
  price: string;
  regular_price: string;
  sale_price: string;
  currency: string;
  stock_status?: string | null;
  stock_quantity?: number | null;
  weight?: number | null;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ src: string; alt?: string | null }>;
  attributes?: unknown;
  meta?: unknown;
  short_description?: string;
  description: string;
  permalink?: string;
};

const productsDir = path.join(process.cwd(), 'content', 'products');

async function readProductFile(filePath: string): Promise<LocalProduct> {
  const file = await fs.readFile(filePath, 'utf8');
  const parsed = matter(file, {
    engines: {
      yaml: (s) => yaml.load(s, { json: true }) as object
    }
  });
  const data = parsed.data as Record<string, unknown>;
  const body = (parsed.content || '').trim();

  const wcId = Number(data.wcId || data.id);
  const price = Number(data.price ?? data.regularPrice ?? 0);
  const regular = Number(data.regularPrice ?? data.price ?? 0);
  const sale = data.salePrice ? Number(data.salePrice) : NaN;

  return {
    id: wcId,
    wcId,
    name: String(data.name || ''),
    slug: String(data.slug || path.basename(filePath, '.md')),
    type: String(data.type || 'simple'),
    status: String(data.status || 'publish'),
    sku: (data.sku as string | undefined) || null,
    price: price.toFixed(2),
    regular_price: regular.toFixed(2),
    sale_price: Number.isFinite(sale) ? sale.toFixed(2) : '',
    currency: String(data.currency || 'EUR'),
    stock_status: (data.stockStatus as string | undefined) || null,
    stock_quantity: typeof data.stockQuantity === 'number' ? data.stockQuantity : null,
    weight: typeof data.weight === 'number' ? data.weight : null,
    categories: Array.isArray(data.categories) ? data.categories as Array<{ id: number; name: string; slug: string }> : [],
    images: Array.isArray(data.images) ? (data.images as Array<{ src: string; alt?: string | null }>).map(img => ({
      src: img.src,
      alt: img.alt ?? null
    })) : [],
    attributes: data.attributes,
    meta: data.meta,
    short_description: typeof data.shortDescription === 'string' ? data.shortDescription : undefined,
    description: body || (typeof data.description === 'string' ? data.description : ''),
    permalink: typeof data.permalink === 'string' ? data.permalink : undefined
  };
}

export async function getAllProducts(): Promise<LocalProduct[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(productsDir);
  } catch {
    return [];
  }

  const mdFiles = files.filter(f => f.endsWith('.md'));
  const products = await Promise.all(mdFiles.map(file => readProductFile(path.join(productsDir, file))));
  return products.sort((a, b) => a.id - b.id);
}

export async function getProductsByIds(ids: number[]): Promise<LocalProduct[]> {
  if (!ids.length) return [];
  const all = await getAllProducts();
  const idSet = new Set(ids);
  return all.filter(p => idSet.has(p.id));
}

export async function getProductBySlug(slug: string): Promise<LocalProduct | null> {
  try {
    const filePath = path.join(productsDir, `${slug}.md`);
    const product = await readProductFile(filePath);
    return product;
  } catch {
    const all = await getAllProducts();
    return all.find(p => p.slug === slug) || null;
  }
}
