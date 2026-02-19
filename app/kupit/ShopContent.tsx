'use client';

import { useCallback, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryTracking from '../components/CategoryTracking';
import { getProducts } from '../lib/orders';
import type { Product } from '../lib/content-types';

type ProductSection = {
  title: string;
  taxonomy: string;
  gridCols: string;
  products: Product[];
};

const INITIAL_SECTIONS: ProductSection[] = [
  { title: 'Akciové sety', taxonomy: '29', gridCols: 'grid-cols-1 md:grid-cols-4', products: [] },
  { title: 'JointBoost gél', taxonomy: '44', gridCols: 'grid-cols-1 md:grid-cols-5', products: [] },
  { title: 'Kĺbová výživa', taxonomy: '15', gridCols: 'grid-cols-1 md:grid-cols-5', products: [] },
  { title: 'Ďalšie produkty', taxonomy: '30', gridCols: 'grid-cols-1 md:grid-cols-4', products: [] }
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

export default function ShopContent() {
  const [productSections, setProductSections] = useState<ProductSection[]>(INITIAL_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndCategorizeProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Fetch all products in one go
      const allProducts = await getProducts();

      // Create a map of sections for easy lookup
      const sectionsMap = new Map<string, Product[]>();
      INITIAL_SECTIONS.forEach(section => sectionsMap.set(section.taxonomy, []));

      // Distribute products into sections
      allProducts.forEach((product: Product) => {
        product.categories.forEach(category => {
          const categoryId = category.id.toString();
          if (sectionsMap.has(categoryId)) {
            sectionsMap.get(categoryId)?.push(product);
          }
        });
      });

      // Update the sections with sorted products
      const updatedSections = INITIAL_SECTIONS.map(section => {
        let products = sectionsMap.get(section.taxonomy) || [];

        // Sort by price
        products = sortProductsByPrice(products);

        // If this section contains the Duo Set (ID 824), move it to the top
        const duoSetIndex = products.findIndex(p => p.id === 824);
        if (duoSetIndex > -1) {
          const duoSet = products.splice(duoSetIndex, 1)[0];
          products.unshift(duoSet);
        }

        return {
          ...section,
          products
        };
      });

      setProductSections(updatedSections);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Naše produkty</h1>
        <p className="mt-2 text-lg text-gray-600">Objavte našu ponuku kĺbovej výživy</p>
      </div>

      {/* Cure bundles (manual, adds separate products) */}
      {(() => {
        const CureBundles = require('./CureBundles').default;
        return <CureBundles />;
      })()}

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
                  isPriority={index < 4}
                  isHero={product.id === 824}
                />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
