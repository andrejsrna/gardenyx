'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '../../components/ProductCard';
import CategoryTracking from '../../components/CategoryTracking';
import { getProducts } from '../../lib/orders';
import type { Product } from '../../lib/content-types';

type ProductSection = {
  title: string;
  taxonomy: string;
  gridCols: string;
  products: Product[];
};

const INITIAL_SECTIONS: ProductSection[] = [
  { title: 'Hakofyt B', taxonomy: 'hnojiva-hakofyt-b', gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3', products: [] },
  { title: 'Hakofyt Plus', taxonomy: 'hnojiva-hakofyt-plus', gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3', products: [] },
  { title: 'Hakofyt Max', taxonomy: 'hnojiva-hakofyt-max', gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3', products: [] },
  { title: 'Ochrana rastlín', taxonomy: 'herbicidy', gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3', products: [] },
  { title: 'Insekticídy', taxonomy: 'insekticidy', gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3', products: [] }
];

const sortProductsByPrice = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
};

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse space-y-12">
      {INITIAL_SECTIONS.map((section, index) => (
        <div key={index}>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className={`grid ${section.gridCols} gap-6`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Niečo sa pokazilo</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Skúsiť znova
      </button>
    </div>
  </div>
);

export default function ShopContent({ locale }: { locale: string }) {
  const t = useTranslations('shop');
  const [productSections, setProductSections] = useState<ProductSection[]>(INITIAL_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndCategorizeProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Fetch all products in one go
      const allProducts = await getProducts({ locale });

      const sectionsMap = new Map<string, Product[]>();
      INITIAL_SECTIONS.forEach(section => sectionsMap.set(section.taxonomy, []));

      allProducts.forEach((product: Product) => {
        product.categories.forEach(category => {
          if (sectionsMap.has(category.slug)) {
            sectionsMap.get(category.slug)?.push(product);
          }
        });
      });

      const updatedSections = INITIAL_SECTIONS.map(section => {
        let products = sectionsMap.get(section.taxonomy) || [];
        products = sortProductsByPrice(products);

        return {
          ...section,
          title: t(`sections.${section.taxonomy}`),
          products
        };
      });

      setProductSections(updatedSections);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchAndCategorizeProducts();
  }, [fetchAndCategorizeProducts]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchAndCategorizeProducts} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-lg text-gray-600">{t('intro')}</p>
      </div>

      {productSections.map((section) => (
        section.products.length > 0 && (
          <section key={section.taxonomy} className="space-y-6">
            <CategoryTracking categoryName={section.title} products={section.products} />
            <h2 className="text-3xl font-bold">{section.title}</h2>
            <div className={`grid ${section.gridCols} gap-6`}>
              {section.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  isPriority={index < 4}
                  isHero={index === 0}
                />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
