'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';

import prisma from '@/app/lib/prisma';

function parseTranslations(formData: FormData) {
  const locales = ['sk', 'en', 'hu'] as const;
  const result: Record<string, { slug: string; title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string }> = {};
  for (const locale of locales) {
    result[locale] = {
      slug: String(formData.get(`translations.${locale}.slug`) ?? '').trim(),
      title: String(formData.get(`translations.${locale}.title`) ?? ''),
      excerpt: String(formData.get(`translations.${locale}.excerpt`) ?? ''),
      content: String(formData.get(`translations.${locale}.content`) ?? ''),
      metaTitle: String(formData.get(`translations.${locale}.metaTitle`) ?? ''),
      metaDescription: String(formData.get(`translations.${locale}.metaDescription`) ?? ''),
    };
  }
  return result;
}

export async function createArticleAction(_prevState: unknown, formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) throw new Error('Slug je povinný');

  const status = String(formData.get('status') ?? 'draft') as 'draft' | 'published';
  const coverImage = String(formData.get('coverImage') ?? '') || null;
  const publishedAtRaw = formData.get('publishedAt');
  const publishedAt = publishedAtRaw ? new Date(String(publishedAtRaw)) : (status === 'published' ? new Date() : null);

  try {
    await prisma.article.create({
      data: {
        slug,
        status,
        coverImage,
        publishedAt,
        translations: parseTranslations(formData),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new Error('Článok s týmto slugom už existuje');
    }
    throw err;
  }

  revalidatePath('/admin/articles');
  redirect('/admin/articles?saved=1');
}

export async function updateArticleAction(_prevState: unknown, formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) throw new Error('Slug je povinný');

  const status = String(formData.get('status') ?? 'draft') as 'draft' | 'published';
  const coverImage = String(formData.get('coverImage') ?? '') || null;
  const publishedAtRaw = formData.get('publishedAt');
  const publishedAt = publishedAtRaw ? new Date(String(publishedAtRaw)) : null;

  try {
    await prisma.article.update({
      where: { id },
      data: {
        slug,
        status,
        coverImage,
        publishedAt,
        translations: parseTranslations(formData),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new Error('Článok s týmto slugom už existuje');
    }
    throw err;
  }

  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${slug}`);
  redirect('/admin/articles?saved=1');
}

export async function deleteArticleAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  await prisma.article.delete({ where: { id } });
  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}
