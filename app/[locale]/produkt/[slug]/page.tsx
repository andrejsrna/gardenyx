import { getAllProducts } from '@/app/lib/products';
import AddToCartButton from './AddToCartButton';
import ProductTracking from './ProductTracking';
import BuyNowCTA from './BuyNowCTA';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, Leaf, ShieldCheck, Truck } from 'lucide-react';
import ProductSchema from '@/app/components/seo/ProductSchema';
import BreadcrumbSchema from '@/app/components/seo/BreadcrumbSchema';
import ProductShowcaseSection from '@/app/components/ProductShowcaseSection';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

const DEFAULT_LOCALE = 'sk';

function getLocalePrefix(locale: string) {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getProduct(slug: string, locale?: string) {
  const products = await getAllProducts(locale);
  return products.find((product) => product.slug === slug) || null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);

  if (!product) {
    return {
      title: 'Produkt nenájdený | GardenYX',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const localePrefix = getLocalePrefix(locale);
  const canonicalUrl = siteUrl ? `${siteUrl}${localePrefix}/produkt/${product.slug}` : undefined;
  const description = stripHtml(product.short_description || product.description).slice(0, 160);

  return {
    title: `${product.name} | GardenYX`,
    description,
    openGraph: {
      title: `${product.name} | GardenYX`,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'GardenYX',
      locale,
      images: product.images.map((image) => ({
        url: image.src,
        alt: image.alt || product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | GardenYX`,
      description,
      images: product.images[0]?.src ? [product.images[0].src] : [],
    },
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);
  const t = await getTranslations({ locale, namespace: 'productPage' });

  if (!product) {
    notFound();
  }

  const imageUrl = product.images[0]?.src;
  const price = parseFloat(product.price);
  const regularPrice = parseFloat(product.regular_price);
  const hasDiscount = product.sale_price !== '' && price < regularPrice;
  const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;
  const isVariable = product.type === 'variable' && product.variants && product.variants.length > 0;
  const minVariantPrice = isVariable
    ? Math.min(...(product.variants ?? []).map((v) => v.price))
    : null;
  const stockLabel = product.stock_status === 'instock' ? t('stock.inStock') : t('stock.outOfStock');
  const stockClass = product.stock_status === 'instock' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50';
  const localePrefix = getLocalePrefix(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const productUrl = siteUrl ? `${siteUrl}${localePrefix}/produkt/${product.slug}` : `${localePrefix}/produkt/${product.slug}`;

  const breadcrumbItems = [
    { name: t('breadcrumbs.home'), url: siteUrl ? `${siteUrl}${localePrefix}` : `${localePrefix || '/'}` },
    { name: t('breadcrumbs.shop'), url: siteUrl ? `${siteUrl}${localePrefix}/kupit` : `${localePrefix}/kupit` },
    { name: product.name, url: productUrl },
  ];

  const highlights = [
    { icon: Leaf, title: t('highlights.growing.title'), description: t('highlights.growing.description') },
    { icon: Truck, title: t('highlights.delivery.title'), description: t('highlights.delivery.description') },
    { icon: ShieldCheck, title: t('highlights.checkout.title'), description: t('highlights.checkout.description') },
  ];
  const primaryCategorySlug = product.categories[0]?.slug;
  const relatedProducts = (await getAllProducts(locale))
    .filter((candidate) => candidate.slug !== product.slug)
    .sort((a, b) => {
      const aMatchesCategory = primaryCategorySlug ? a.categories.some((category) => category.slug === primaryCategorySlug) : false;
      const bMatchesCategory = primaryCategorySlug ? b.categories.some((category) => category.slug === primaryCategorySlug) : false;

      if (aMatchesCategory !== bMatchesCategory) {
        return aMatchesCategory ? -1 : 1;
      }

      return b.wcId - a.wcId;
    })
    .slice(0, 4);

  return (
    <>
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <ProductTracking product={product} />

      <div className="min-h-screen bg-stone-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-contain p-6"
                  />
                ) : null}
                {hasDiscount ? (
                  <div className="absolute right-4 top-4 rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white shadow-lg">
                    -{discount}%
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`${localePrefix}/kupit`}
                    className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">{product.name}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {isVariable && minVariantPrice !== null ? (
                  <span className="text-4xl font-bold text-stone-900">{t('priceFrom')} {minVariantPrice.toFixed(2)} €</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-stone-900">{price.toFixed(2)} €</span>
                    {hasDiscount ? <span className="text-xl text-stone-400 line-through">{regularPrice.toFixed(2)} €</span> : null}
                  </>
                )}
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${stockClass}`}>{stockLabel}</span>
              </div>

              {product.short_description ? (
                <p className="mt-6 text-base leading-7 text-stone-700">{product.short_description}</p>
              ) : null}

              <div className="mt-8">
                <AddToCartButton product={product} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-stone-50 p-4">
                    <item.icon className="h-5 w-5 text-green-700" />
                    <h2 className="mt-3 text-sm font-semibold text-stone-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {product.description ? (
            <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
                <h2 className="text-2xl font-bold text-stone-900">{t('descriptionTitle')}</h2>
              </div>
              <div
                className="prose prose-stone mt-6 max-w-none prose-headings:text-stone-900 prose-strong:text-stone-900"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          ) : null}

          {product.documents && product.documents.length > 0 && (
            <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-bold text-stone-900">Dokumenty na stiahnutie</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.documents
                  .filter((doc) => doc.lang === 'all' || doc.lang === locale || doc.lang === 'sk')
                  .map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-green-400 hover:bg-green-50 hover:text-green-800 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5H7zm5 0v4a1 1 0 001 1h4M9 13h6M9 17h4" />
                      </svg>
                      {doc.label}
                      {doc.lang !== 'all' && <span className="text-xs text-stone-400 uppercase">{doc.lang}</span>}
                    </a>
                  ))}
              </div>
            </section>
          )}

          <BuyNowCTA product={product} />

          <ProductShowcaseSection
            eyebrow={t('relatedProducts.eyebrow')}
            title={t('relatedProducts.title')}
            description={t('relatedProducts.description')}
            detailLabel={t('relatedProducts.detail')}
            products={relatedProducts}
            cta={{ href: '/kupit', label: t('relatedProducts.viewAll') }}
            className="py-16"
          />
        </div>
      </div>
    </>
  );
}
