import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import type { Prisma, Product as PrismaProduct } from '@prisma/client';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

import prisma from './prisma';

export type ProductTranslationInput = {
  name?: string;
  shortDescription?: string;
  description?: string;
};

export type ProductTranslationsInput = Partial<Record<'en' | 'hu', ProductTranslationInput>>;

type ProductTranslation = {
  name?: string;
  shortDescription?: string;
  description?: string;
};

type ProductTranslations = Partial<Record<'en' | 'hu', ProductTranslation>>;

export type ProductCategory = { id: number; name: string; slug: string };
export type ProductImage = { src: string; alt?: string | null };
export type ProductVariant = { id: number; name: string; sku?: string | null; price: number; stockStatus?: string | null };

export type StoredProductRecord = {
  wcId: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  sku?: string | null;
  price: number;
  regularPrice: number;
  salePrice?: number | null;
  currency: string;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  weight?: number | null;
  categories: ProductCategory[];
  images: ProductImage[];
  variants?: ProductVariant[];
  attributes?: unknown;
  meta?: unknown;
  shortDescription?: string;
  description?: string;
  permalink?: string;
  translations?: ProductTranslationsInput;
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
  categories: ProductCategory[];
  images: ProductImage[];
  variants?: ProductVariant[];
  attributes?: unknown;
  meta?: unknown;
  short_description?: string;
  description: string;
  permalink?: string;
  translations?: ProductTranslations;
};

const categoryTranslations: Record<string, Partial<Record<'en' | 'hu', string>>> = {
  'hnojiva-hakofyt-b': {
    en: 'Hakofyt B Fertilizers',
    hu: 'Hakofyt B Mutragyak',
  },
  'hnojiva-hakofyt-plus': {
    en: 'Hakofyt Plus Fertilizers',
    hu: 'Hakofyt Plus Mutragyak',
  },
  'hnojiva-hakofyt-max': {
    en: 'Hakofyt Max Fertilizers',
    hu: 'Hakofyt Max Mutragyak',
  },
  herbicidy: {
    en: 'Plant Protection',
    hu: 'Novenyvedelem',
  },
  insekticidy: {
    en: 'Insecticides',
    hu: 'Rovarolo Szerek',
  },
};

const productsDir = path.join(process.cwd(), 'content', 'products');

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'bigint') {
    const nextValue = Number(value);
    return Number.isSafeInteger(nextValue) ? nextValue : null;
  }

  if (typeof value === 'string' && value.trim()) {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : null;
  }

  return null;
}

function decimalToNumber(value: Prisma.Decimal | number | string | bigint | null | undefined): number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }

  return normalizeNumber(value);
}

async function renderMarkdown(markdown: string): Promise<string> {
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(markdown);
  return processed.toString();
}

function normalizeTranslationInputs(value: unknown): ProductTranslationsInput | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const translations = Object.entries(value).reduce<ProductTranslationsInput>((acc, [locale, rawTranslation]) => {
    if ((locale !== 'en' && locale !== 'hu') || !isRecord(rawTranslation)) {
      return acc;
    }

    acc[locale] = {
      name: typeof rawTranslation.name === 'string' ? rawTranslation.name : undefined,
      shortDescription: typeof rawTranslation.shortDescription === 'string' ? rawTranslation.shortDescription : undefined,
      description: typeof rawTranslation.description === 'string' ? rawTranslation.description : undefined,
    };

    return acc;
  }, {});

  return Object.keys(translations).length ? translations : undefined;
}

async function renderTranslations(translations?: ProductTranslationsInput): Promise<ProductTranslations | undefined> {
  if (!translations) {
    return undefined;
  }

  const entries = await Promise.all(
    Object.entries(translations).map(async ([locale, translation]) => {
      if (!translation) {
        return null;
      }

      return [
        locale,
        {
          name: translation.name,
          shortDescription: translation.shortDescription,
          description: typeof translation.description === 'string'
            ? await renderMarkdown(translation.description)
            : undefined,
        } satisfies ProductTranslation,
      ] as const;
    }),
  );

  const filtered = Object.fromEntries(entries.filter(Boolean) as Array<readonly [string, ProductTranslation]>);
  return Object.keys(filtered).length ? (filtered as ProductTranslations) : undefined;
}

function localizeCategories(categories: ProductCategory[], locale?: string): ProductCategory[] {
  if (!locale || locale === 'sk') {
    return categories;
  }

  return categories.map((category) => ({
    ...category,
    name: categoryTranslations[category.slug]?.[locale as 'en' | 'hu'] || category.name,
  }));
}

function localizeProduct(product: LocalProduct, locale?: string): LocalProduct {
  if (!locale || locale === 'sk') {
    return {
      ...product,
      categories: localizeCategories(product.categories, locale),
    };
  }

  const translation = product.translations?.[locale as keyof ProductTranslations];
  return {
    ...product,
    name: translation?.name || product.name,
    short_description: translation?.shortDescription || product.short_description,
    description: translation?.description || product.description,
    categories: localizeCategories(product.categories, locale),
  };
}

function normalizeVariants(value: unknown): ProductVariant[] | undefined {
  if (!Array.isArray(value) || !value.length) {
    return undefined;
  }

  const variants = value
    .filter(isRecord)
    .map((v) => ({
      id: normalizeNumber(v.id) || 0,
      name: typeof v.name === 'string' ? v.name : '',
      sku: typeof v.sku === 'string' ? v.sku : null,
      price: normalizeNumber(v.price) || 0,
      stockStatus: typeof v.stockStatus === 'string' ? v.stockStatus : null,
    }))
    .filter((v) => v.name);

  return variants.length ? variants : undefined;
}

function normalizeCategories(value: unknown): ProductCategory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((category) => ({
      id: normalizeNumber(category.id) || 0,
      name: typeof category.name === 'string' ? category.name : '',
      slug: typeof category.slug === 'string' ? category.slug : '',
    }))
    .filter((category) => category.slug);
}

function normalizeImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((image) => ({
      src: typeof image.src === 'string' ? image.src : '',
      alt: typeof image.alt === 'string' ? image.alt : null,
    }))
    .filter((image) => image.src);
}

async function mapStoredRecordToLocalProduct(record: StoredProductRecord): Promise<LocalProduct> {
  const renderedDescription = record.description ? await renderMarkdown(record.description) : '';
  const renderedTranslations = await renderTranslations(record.translations);

  return {
    id: record.wcId,
    wcId: record.wcId,
    name: record.name,
    slug: record.slug,
    type: record.type || 'simple',
    status: record.status || 'publish',
    sku: record.sku || null,
    price: record.price.toFixed(2),
    regular_price: record.regularPrice.toFixed(2),
    sale_price: typeof record.salePrice === 'number' && Number.isFinite(record.salePrice) ? record.salePrice.toFixed(2) : '',
    currency: record.currency || 'EUR',
    stock_status: record.stockStatus || null,
    stock_quantity: typeof record.stockQuantity === 'number' ? record.stockQuantity : null,
    weight: typeof record.weight === 'number' ? record.weight : null,
    categories: record.categories,
    images: record.images,
    variants: record.variants,
    attributes: record.attributes,
    meta: record.meta,
    short_description: record.shortDescription,
    description: renderedDescription,
    permalink: record.permalink,
    translations: renderedTranslations,
  };
}

function mapPrismaProductToStoredRecord(product: PrismaProduct): StoredProductRecord {
  const wcId = normalizeNumber(product.wcId) || 0;

  return {
    wcId,
    name: product.name,
    slug: product.slug,
    type: product.type,
    status: product.status,
    sku: product.sku,
    price: decimalToNumber(product.price) || 0,
    regularPrice: decimalToNumber(product.regularPrice) || 0,
    salePrice: decimalToNumber(product.salePrice),
    currency: product.currency,
    stockStatus: product.stockStatus,
    stockQuantity: product.stockQuantity,
    weight: decimalToNumber(product.weight),
    categories: normalizeCategories(product.categories),
    images: normalizeImages(product.images),
    attributes: product.attributes,
    meta: product.meta,
    shortDescription: product.shortDescription || undefined,
    description: product.description || undefined,
    translations: normalizeTranslationInputs(product.translations),
  };
}

async function readMarkdownProductFile(filePath: string): Promise<StoredProductRecord> {
  const file = await fs.readFile(filePath, 'utf8');
  const parsed = matter(file, {
    engines: {
      yaml: (source) => yaml.load(source, { json: true }) as object,
    },
  });
  const data = parsed.data as Record<string, unknown>;

  return {
    wcId: normalizeNumber(data.wcId ?? data.id) || 0,
    name: String(data.name || ''),
    slug: String(data.slug || path.basename(filePath, '.md')),
    type: String(data.type || 'simple'),
    status: String(data.status || 'publish'),
    sku: typeof data.sku === 'string' ? data.sku : null,
    price: normalizeNumber(data.price ?? data.regularPrice) || 0,
    regularPrice: normalizeNumber(data.regularPrice ?? data.price) || 0,
    salePrice: normalizeNumber(data.salePrice),
    currency: String(data.currency || 'EUR'),
    stockStatus: typeof data.stockStatus === 'string' ? data.stockStatus : null,
    stockQuantity: normalizeNumber(data.stockQuantity),
    weight: normalizeNumber(data.weight),
    categories: normalizeCategories(data.categories),
    images: normalizeImages(data.images),
    variants: normalizeVariants(data.variants),
    attributes: data.attributes,
    meta: data.meta,
    shortDescription: typeof data.shortDescription === 'string' ? data.shortDescription : undefined,
    description: parsed.content.trim() || (typeof data.description === 'string' ? data.description : undefined),
    permalink: typeof data.permalink === 'string' ? data.permalink : undefined,
    translations: normalizeTranslationInputs(data.translations),
  };
}

async function readDbProducts(): Promise<LocalProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: { wcId: 'asc' },
  });

  return Promise.all(products.map(async (product) => mapStoredRecordToLocalProduct(mapPrismaProductToStoredRecord(product))));
}

export async function getAllMarkdownProducts(): Promise<StoredProductRecord[]> {
  let files: string[] = [];

  try {
    files = await fs.readdir(productsDir);
  } catch {
    return [];
  }

  const markdownFiles = files.filter((file) => file.endsWith('.md'));
  const products = await Promise.all(markdownFiles.map((file) => readMarkdownProductFile(path.join(productsDir, file))));
  return products.sort((a, b) => a.wcId - b.wcId);
}

async function readMarkdownProducts(locale?: string): Promise<LocalProduct[]> {
  const products = await getAllMarkdownProducts();
  const localizedProducts = await Promise.all(products.map(mapStoredRecordToLocalProduct));
  return localizedProducts.map((product) => localizeProduct(product, locale));
}

export async function getAllProducts(locale?: string): Promise<LocalProduct[]> {
  try {
    const dbProducts = await readDbProducts();
    if (dbProducts.length > 0) {
      return dbProducts.map((product) => localizeProduct(product, locale));
    }
  } catch (error) {
    console.warn('[products] falling back to markdown source', error);
  }

  return readMarkdownProducts(locale);
}

export async function getProductsByIds(ids: number[], locale?: string): Promise<LocalProduct[]> {
  if (!ids.length) {
    return [];
  }

  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        wcId: {
          in: ids.map((id) => BigInt(id)),
        },
      },
      orderBy: { wcId: 'asc' },
    });

    if (dbProducts.length > 0) {
      const localizedProducts = await Promise.all(
        dbProducts.map(async (product) => mapStoredRecordToLocalProduct(mapPrismaProductToStoredRecord(product))),
      );
      return localizedProducts.map((product) => localizeProduct(product, locale));
    }
  } catch (error) {
    console.warn('[products] db lookup by ids failed, falling back to markdown source', error);
  }

  const allProducts = await getAllProducts(locale);
  const idSet = new Set(ids);
  return allProducts.filter((product) => idSet.has(product.id));
}

export async function getProductBySlug(slug: string, locale?: string): Promise<LocalProduct | null> {
  try {
    const dbProduct = await prisma.product.findUnique({ where: { slug } });
    if (dbProduct) {
      const localizedProduct = await mapStoredRecordToLocalProduct(mapPrismaProductToStoredRecord(dbProduct));
      return localizeProduct(localizedProduct, locale);
    }
  } catch (error) {
    console.warn('[products] db lookup by slug failed, falling back to markdown source', error);
  }

  try {
    const filePath = path.join(productsDir, `${slug}.md`);
    const markdownProduct = await readMarkdownProductFile(filePath);
    return localizeProduct(await mapStoredRecordToLocalProduct(markdownProduct), locale);
  } catch {
    const allProducts = await getAllProducts(locale);
    return allProducts.find((product) => product.slug === slug) || null;
  }
}
