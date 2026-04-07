import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

type ProductTranslation = {
  name?: string;
  shortDescription?: string;
  description?: string;
};

type ProductTranslations = Partial<Record<'en' | 'hu', ProductTranslation>>;

const categoryTranslations: Record<string, Partial<Record<'en' | 'hu', string>>> = {
  'hnojiva-hakofyt-b': {
    en: 'Hakofyt B Fertilizers',
    hu: 'Hakofyt B Műtrágyák',
  },
  'hnojiva-hakofyt-plus': {
    en: 'Hakofyt Plus Fertilizers',
    hu: 'Hakofyt Plus Műtrágyák',
  },
  'hnojiva-hakofyt-max': {
    en: 'Hakofyt Max Fertilizers',
    hu: 'Hakofyt Max Műtrágyák',
  },
  herbicidy: {
    en: 'Plant Protection',
    hu: 'Növényvédelem',
  },
  insekticidy: {
    en: 'Insecticides',
    hu: 'Rovarölő Szerek',
  },
};

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
  translations?: ProductTranslations;
};

const productsDir = path.join(process.cwd(), 'content', 'products');

async function renderMarkdown(markdown: string): Promise<string> {
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(markdown);
  return processed.toString();
}

async function normalizeTranslations(value: unknown): Promise<ProductTranslations | undefined> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const translations = await Promise.all(entries.map(async ([locale, rawTranslation]) => {
    if (!rawTranslation || typeof rawTranslation !== 'object' || Array.isArray(rawTranslation)) {
      return null;
    }

    const translation = rawTranslation as Record<string, unknown>;
    return [
      locale,
      {
        name: typeof translation.name === 'string' ? translation.name : undefined,
        shortDescription: typeof translation.shortDescription === 'string' ? translation.shortDescription : undefined,
        description: typeof translation.description === 'string'
          ? await renderMarkdown(translation.description)
          : undefined,
      } satisfies ProductTranslation,
    ] as const;
  }));

  const filtered = entries.length ? Object.fromEntries(translations.filter(Boolean) as Array<readonly [string, ProductTranslation]>) : {};
  return Object.keys(filtered).length ? filtered as ProductTranslations : undefined;
}

function localizeProduct(product: LocalProduct, locale?: string): LocalProduct {
  if (!locale || locale === 'sk' || !product.translations?.[locale as keyof ProductTranslations]) {
    return {
      ...product,
      categories: localizeCategories(product.categories, locale),
    };
  }

  const translation = product.translations[locale as keyof ProductTranslations];
  if (!translation) {
    return {
      ...product,
      categories: localizeCategories(product.categories, locale),
    };
  }

  return {
    ...product,
    name: translation.name || product.name,
    short_description: translation.shortDescription || product.short_description,
    description: translation.description || product.description,
    categories: localizeCategories(product.categories, locale),
  };
}

function localizeCategories(
  categories: LocalProduct['categories'],
  locale?: string,
): LocalProduct['categories'] {
  if (!locale || locale === 'sk') {
    return categories;
  }

  return categories.map((category) => ({
    ...category,
    name: categoryTranslations[category.slug]?.[locale as 'en' | 'hu'] || category.name,
  }));
}

async function readProductFile(filePath: string): Promise<LocalProduct> {
  const file = await fs.readFile(filePath, 'utf8');
  const parsed = matter(file, {
    engines: {
      yaml: (s) => yaml.load(s, { json: true }) as object
    }
  });
  const data = parsed.data as Record<string, unknown>;
  const body = (parsed.content || '').trim();
  const processedBody = body ? await renderMarkdown(body) : '';
  const translations = await normalizeTranslations(data.translations);

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
    description: processedBody || (typeof data.description === 'string' ? data.description : ''),
    permalink: typeof data.permalink === 'string' ? data.permalink : undefined,
    translations,
  };
}

export async function getAllProducts(locale?: string): Promise<LocalProduct[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(productsDir);
  } catch {
    return [];
  }

  const mdFiles = files.filter(f => f.endsWith('.md'));
  const products = await Promise.all(mdFiles.map(file => readProductFile(path.join(productsDir, file))));
  return products
    .sort((a, b) => a.id - b.id)
    .map((product) => localizeProduct(product, locale));
}

export async function getProductsByIds(ids: number[], locale?: string): Promise<LocalProduct[]> {
  if (!ids.length) return [];
  const all = await getAllProducts(locale);
  const idSet = new Set(ids);
  return all.filter(p => idSet.has(p.id));
}

export async function getProductBySlug(slug: string, locale?: string): Promise<LocalProduct | null> {
  try {
    const filePath = path.join(productsDir, `${slug}.md`);
    const product = await readProductFile(filePath);
    return localizeProduct(product, locale);
  } catch {
    const all = await getAllProducts(locale);
    return all.find(p => p.slug === slug) || null;
  }
}
