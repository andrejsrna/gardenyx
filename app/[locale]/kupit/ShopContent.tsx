'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '../../components/ProductCard';
import CategoryTracking from '../../components/CategoryTracking';
import { getProducts } from '../../lib/orders';
import type { Product } from '../../lib/content-types';

type CategoryKey =
  | 'all'
  | 'hnojiva-hakofyt-b'
  | 'hnojiva-hakofyt-plus'
  | 'hnojiva-hakofyt-max'
  | 'herbicidy'
  | 'insekticidy';

const CATEGORY_ORDER: Exclude<CategoryKey, 'all'>[] = [
  'hnojiva-hakofyt-b',
  'hnojiva-hakofyt-plus',
  'hnojiva-hakofyt-max',
  'herbicidy',
  'insekticidy',
];

const sortProducts = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const aCategoryIndex = CATEGORY_ORDER.findIndex((slug) =>
      a.categories.some((category) => category.slug === slug),
    );
    const bCategoryIndex = CATEGORY_ORDER.findIndex((slug) =>
      b.categories.some((category) => category.slug === slug),
    );

    if (aCategoryIndex !== bCategoryIndex) {
      return aCategoryIndex - bCategoryIndex;
    }

    return parseFloat(a.price) - parseFloat(b.price);
  });
};

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse space-y-8">
      <div className="text-center">
        <div className="mx-auto h-10 w-64 rounded bg-gray-200" />
        <div className="mx-auto mt-3 h-6 w-96 max-w-full rounded bg-gray-200" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-11 w-32 rounded-full bg-gray-200" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="h-96 rounded-3xl bg-gray-200" />
        ))}
      </div>
    </div>
  </div>
);

function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  const t = useTranslations('shop');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">{t('error.title')}</h2>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {t('error.retry')}
        </button>
      </div>
    </div>
  );
}

export default function ShopContent({ locale }: { locale: string }) {
  const t = useTranslations('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const allProducts = await getProducts({ locale });
        if (!isActive) {
          return;
        }
        setProducts(sortProducts(allProducts));
      } catch (error) {
        if (!isActive) {
          return;
        }
        setError(error instanceof Error ? error.message : t('error.fallback'));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [locale, reloadNonce, t]);

  const availableCategories = CATEGORY_ORDER.filter((taxonomy) =>
    products.some((product) => product.categories.some((category) => category.slug === taxonomy)),
  );

  const filterOptions: Array<{ key: CategoryKey; label: string }> = [
    { key: 'all', label: t('filters.all') },
    ...availableCategories.map((taxonomy) => ({
      key: taxonomy,
      label: t(`sections.${taxonomy}`),
    })),
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((product) =>
        product.categories.some((category) => category.slug === selectedCategory),
      );

  const trackingLabel = selectedCategory === 'all'
    ? t('filters.allTracking')
    : t(`sections.${selectedCategory}`);

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => setReloadNonce((value) => value + 1)} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-lg text-gray-600">{t('intro')}</p>
      </div>

      <div className="mx-auto max-w-5xl rounded-3xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
            {t('filters.title')}
          </p>
          <p className="text-sm text-stone-600">
            {t('filters.results', { count: filteredProducts.length })}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {filterOptions.map((option) => {
            const isActive = selectedCategory === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedCategory(option.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <>
          <CategoryTracking categoryName={trackingLabel} products={filteredProducts} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                isPriority={index < 4}
                isHero={index === 0}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center text-stone-600">
          {t('filters.empty')}
        </div>
      )}
    </div>
  );
}
