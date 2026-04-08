'use server';

import { Prisma, ProductStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import prisma from '@/app/lib/prisma';
import { getAllMarkdownProducts } from '@/app/lib/products';

const PRODUCT_STATUSES = new Set<string>(Object.values(ProductStatus));
const STOCK_STATUSES = new Set(['instock', 'outofstock', 'onbackorder']);

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value || null;
}

function getOptionalNumber(formData: FormData, key: string): number | null {
  const rawValue = getString(formData, key);
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function getTranslationsInput(formData: FormData) {
  const translations = {
    en: {
      name: getOptionalString(formData, 'translations.en.name') || undefined,
      shortDescription: getOptionalString(formData, 'translations.en.shortDescription') || undefined,
      description: getOptionalString(formData, 'translations.en.description') || undefined,
    },
    hu: {
      name: getOptionalString(formData, 'translations.hu.name') || undefined,
      shortDescription: getOptionalString(formData, 'translations.hu.shortDescription') || undefined,
      description: getOptionalString(formData, 'translations.hu.description') || undefined,
    },
  };

  const filtered = Object.fromEntries(
    Object.entries(translations).filter(([, value]) =>
      Boolean(value.name || value.shortDescription || value.description),
    ),
  );

  return Object.keys(filtered).length ? (filtered as Prisma.InputJsonValue) : Prisma.JsonNull;
}

function getCategoriesInput(formData: FormData) {
  const categories = formData.getAll('categories').flatMap((entry) => {
    if (typeof entry !== 'string') {
      return [];
    }

    const [idPart, slug, ...nameParts] = entry.split('|');
    const id = Number(idPart);
    const name = nameParts.join('|');
    if (!Number.isFinite(id) || !slug || !name) {
      return [];
    }

    return [{ id, slug, name }];
  });

  return categories as Prisma.InputJsonValue;
}

function getVariantsInput(formData: FormData): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const raw = formData.get('variantsJson');
  if (typeof raw !== 'string' || !raw) return Prisma.JsonNull;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return Prisma.JsonNull;
    return parsed.map((v: Record<string, unknown>) => ({
      id: typeof v.id === 'number' ? v.id : 0,
      name: String(v.name || ''),
      sku: v.sku ? String(v.sku) : null,
      price: Number(v.price) || 0,
      stockStatus: String(v.stockStatus || 'instock'),
    })) as Prisma.InputJsonValue;
  } catch {
    return Prisma.JsonNull;
  }
}

function getDocumentsInput(formData: FormData): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const raw = formData.get('documentsJson');
  if (typeof raw !== 'string' || !raw) return Prisma.JsonNull;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return Prisma.JsonNull;
    return parsed
      .filter((d: Record<string, unknown>) => d.url)
      .map((d: Record<string, unknown>) => ({
        id: typeof d.id === 'number' ? d.id : 0,
        label: String(d.label || 'Dokument'),
        url: String(d.url),
        lang: String(d.lang || 'sk'),
      })) as Prisma.InputJsonValue;
  } catch {
    return Prisma.JsonNull;
  }
}

function getImagesInput(formData: FormData) {
  const primaryImageSrc = getOptionalString(formData, 'primaryImageSrc');
  const primaryImageAlt = getOptionalString(formData, 'primaryImageAlt');

  if (!primaryImageSrc) {
    return Prisma.JsonNull;
  }

  return [
    {
      src: primaryImageSrc,
      alt: primaryImageAlt,
    },
  ] as Prisma.InputJsonValue;
}

function revalidateProductPaths(slug: string) {
  const localizedProductPaths = [
    `/sk/produkt/${slug}`,
    `/en/product/${slug}`,
    `/hu/termek/${slug}`,
  ];

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath('/sk');
  revalidatePath('/en');
  revalidatePath('/hu');
  revalidatePath('/sk/kupit');
  revalidatePath('/en/shop');
  revalidatePath('/hu/vasarlas');
  revalidatePath('/sk/hnojiva-hakofyt');
  revalidatePath('/en/hakofyt-fertilizers');
  revalidatePath('/hu/hakofyt-mutragyak');
  revalidatePath('/api/products');

  for (const productPath of localizedProductPaths) {
    revalidatePath(productPath);
  }
}

export async function importProductsFromMarkdownAction() {
  const markdownProducts = await getAllMarkdownProducts();

  for (const product of markdownProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        wcId: BigInt(product.wcId),
        name: product.name,
        type: product.type,
        status: PRODUCT_STATUSES.has(product.status) ? (product.status as ProductStatus) : ProductStatus.publish,
        sku: product.sku || null,
        price: product.price,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        currency: product.currency,
        stockStatus: product.stockStatus || null,
        stockQuantity: product.stockQuantity ?? null,
        weight: product.weight ?? null,
        categories: product.categories as Prisma.InputJsonValue,
        images: product.images as Prisma.InputJsonValue,
        attributes: product.attributes ? (product.attributes as Prisma.InputJsonValue) : Prisma.JsonNull,
        meta: product.meta ? (product.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
        shortDescription: product.shortDescription || null,
        description: product.description || null,
        translations: product.translations ? (product.translations as Prisma.InputJsonValue) : Prisma.JsonNull,
        variants: product.variants ? (product.variants as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      create: {
        wcId: BigInt(product.wcId),
        name: product.name,
        slug: product.slug,
        type: product.type,
        status: PRODUCT_STATUSES.has(product.status) ? (product.status as ProductStatus) : ProductStatus.publish,
        sku: product.sku || null,
        price: product.price,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        currency: product.currency,
        stockStatus: product.stockStatus || null,
        stockQuantity: product.stockQuantity ?? null,
        weight: product.weight ?? null,
        categories: product.categories as Prisma.InputJsonValue,
        images: product.images as Prisma.InputJsonValue,
        attributes: product.attributes ? (product.attributes as Prisma.InputJsonValue) : Prisma.JsonNull,
        meta: product.meta ? (product.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
        shortDescription: product.shortDescription || null,
        description: product.description || null,
        translations: product.translations ? (product.translations as Prisma.InputJsonValue) : Prisma.JsonNull,
        variants: product.variants ? (product.variants as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  revalidatePath('/admin/products');
  revalidatePath('/api/products');
  redirect(`/admin/products?imported=${markdownProducts.length}`);
}

export async function createProductAction(formData: FormData) {
  const name = getString(formData, 'name');
  const slug = getString(formData, 'slug');

  if (!name) throw new Error('Názov produktu je povinný');
  if (!slug) throw new Error('Slug je povinný');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Slug môže obsahovať len malé písmená, číslice a pomlčky');

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new Error(`Produkt so slugom "${slug}" už existuje`);

  // Auto-generate wcId from current timestamp to avoid conflicts with WC IDs
  const wcIdRaw = getString(formData, 'wcId');
  const wcId = wcIdRaw ? BigInt(wcIdRaw) : BigInt(Date.now());

  const status = getString(formData, 'status');
  const stockStatus = getString(formData, 'stockStatus');

  await prisma.product.create({
    data: {
      wcId,
      name,
      slug,
      type: getString(formData, 'type') || 'simple',
      status: PRODUCT_STATUSES.has(status) ? (status as ProductStatus) : ProductStatus.draft,
      sku: getOptionalString(formData, 'sku'),
      price: getOptionalNumber(formData, 'price') ?? 0,
      regularPrice: getOptionalNumber(formData, 'regularPrice') ?? 0,
      salePrice: getOptionalNumber(formData, 'salePrice'),
      currency: 'EUR',
      stockStatus: STOCK_STATUSES.has(stockStatus) ? stockStatus : 'instock',
      stockQuantity: getOptionalNumber(formData, 'stockQuantity'),
      weight: getOptionalNumber(formData, 'weight'),
      shortDescription: getOptionalString(formData, 'shortDescription'),
      description: getOptionalString(formData, 'description'),
      categories: getCategoriesInput(formData),
      images: getImagesInput(formData),
      translations: getTranslationsInput(formData),
      variants: getVariantsInput(formData),
      documents: getDocumentsInput(formData),
    },
  });

  revalidateProductPaths(slug);
  redirect(`/admin/products/${slug}?saved=1`);
}

export async function updateProductAction(formData: FormData) {
  const slug = getString(formData, 'slug');
  if (!slug) {
    throw new Error('Missing product slug');
  }

  const existingProduct = await prisma.product.findUnique({ where: { slug } });
  if (!existingProduct) {
    throw new Error(`Product "${slug}" was not found`);
  }

  const status = getString(formData, 'status');
  const stockStatus = getString(formData, 'stockStatus');

  await prisma.product.update({
    where: { slug },
    data: {
      name: getString(formData, 'name'),
      type: getString(formData, 'type') || existingProduct.type,
      status: PRODUCT_STATUSES.has(status) ? (status as ProductStatus) : existingProduct.status,
      sku: getOptionalString(formData, 'sku'),
      price: getOptionalNumber(formData, 'price') ?? 0,
      regularPrice: getOptionalNumber(formData, 'regularPrice') ?? 0,
      salePrice: getOptionalNumber(formData, 'salePrice'),
      currency: getString(formData, 'currency') || existingProduct.currency,
      stockStatus: STOCK_STATUSES.has(stockStatus) ? stockStatus : null,
      stockQuantity: getOptionalNumber(formData, 'stockQuantity'),
      weight: getOptionalNumber(formData, 'weight'),
      shortDescription: getOptionalString(formData, 'shortDescription'),
      description: getOptionalString(formData, 'description'),
      categories: getCategoriesInput(formData),
      images: getImagesInput(formData),
      translations: getTranslationsInput(formData),
      variants: getVariantsInput(formData),
      documents: getDocumentsInput(formData),
    },
  });

  revalidateProductPaths(slug);
  redirect(`/admin/products/${slug}?saved=1`);
}
