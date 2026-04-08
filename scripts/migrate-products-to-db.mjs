import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';
import yaml from 'js-yaml';
import { Prisma, PrismaClient, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const productsDir = path.join(process.cwd(), 'content', 'products');
const PRODUCT_STATUSES = new Set(Object.values(ProductStatus));

function buildConnectionString() {
  const base = process.env.POSTGRES_URL_PRISMA || process.env.POSTGRES_URL;
  if (!base) {
    throw new Error('POSTGRES_URL is required for product migration');
  }

  const schema = process.env.PRISMA_DB_SCHEMA || 'nkv_admin';
  if (base.includes('schema=') || process.env.POSTGRES_URL_PRISMA) {
    return { connectionString: base, schema };
  }

  const separator = base.includes('?') ? '&' : '?';
  return { connectionString: `${base}${separator}schema=${schema}`, schema };
}

const { connectionString, schema } = buildConnectionString();
const pool = new Pool({
  connectionString,
  options: `-c search_path=${schema}`,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool, { schema }),
});

function normalizeNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeTranslations(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value).flatMap(([locale, translation]) => {
    if ((locale !== 'en' && locale !== 'hu') || !translation || typeof translation !== 'object' || Array.isArray(translation)) {
      return [];
    }

    return [[
      locale,
      {
        name: typeof translation.name === 'string' ? translation.name : undefined,
        shortDescription: typeof translation.shortDescription === 'string' ? translation.shortDescription : undefined,
        description: typeof translation.description === 'string' ? translation.description : undefined,
      },
    ]];
  });

  return entries.length ? Object.fromEntries(entries) : null;
}

async function getMarkdownProducts() {
  const files = (await fs.readdir(productsDir)).filter((file) => file.endsWith('.md'));

  return Promise.all(
    files.map(async (file) => {
      const source = await fs.readFile(path.join(productsDir, file), 'utf8');
      const parsed = matter(source, {
        engines: {
          yaml: (frontmatter) => yaml.load(frontmatter, { json: true }),
        },
      });
      const data = parsed.data || {};

      return {
        wcId: normalizeNumber(data.wcId ?? data.id) ?? 0,
        name: String(data.name || ''),
        slug: String(data.slug || file.replace(/\.md$/, '')),
        type: String(data.type || 'simple'),
        status: PRODUCT_STATUSES.has(String(data.status || 'publish')) ? String(data.status || 'publish') : ProductStatus.publish,
        sku: typeof data.sku === 'string' ? data.sku : null,
        price: normalizeNumber(data.price ?? data.regularPrice) ?? 0,
        regularPrice: normalizeNumber(data.regularPrice ?? data.price) ?? 0,
        salePrice: normalizeNumber(data.salePrice),
        currency: String(data.currency || 'EUR'),
        stockStatus: typeof data.stockStatus === 'string' ? data.stockStatus : null,
        stockQuantity: normalizeNumber(data.stockQuantity),
        weight: normalizeNumber(data.weight),
        categories: Array.isArray(data.categories) ? data.categories : [],
        images: Array.isArray(data.images) ? data.images : [],
        attributes: data.attributes ?? Prisma.JsonNull,
        meta: data.meta ?? Prisma.JsonNull,
        shortDescription: typeof data.shortDescription === 'string' ? data.shortDescription : null,
        description: parsed.content.trim() || (typeof data.description === 'string' ? data.description : null),
        translations: normalizeTranslations(data.translations),
      };
    }),
  );
}

const products = await getMarkdownProducts();

for (const product of products) {
  await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      wcId: BigInt(product.wcId),
      name: product.name,
      type: product.type,
      status: product.status,
      sku: product.sku,
      price: product.price,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      currency: product.currency,
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity,
      weight: product.weight,
      categories: product.categories,
      images: product.images,
      attributes: product.attributes,
      meta: product.meta,
      shortDescription: product.shortDescription,
      description: product.description,
      translations: product.translations ?? Prisma.JsonNull,
    },
    create: {
      wcId: BigInt(product.wcId),
      name: product.name,
      slug: product.slug,
      type: product.type,
      status: product.status,
      sku: product.sku,
      price: product.price,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      currency: product.currency,
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity,
      weight: product.weight,
      categories: product.categories,
      images: product.images,
      attributes: product.attributes,
      meta: product.meta,
      shortDescription: product.shortDescription,
      description: product.description,
      translations: product.translations ?? Prisma.JsonNull,
    },
  });
}

console.log(`Migrated ${products.length} products to database.`);

await prisma.$disconnect();
await pool.end();
