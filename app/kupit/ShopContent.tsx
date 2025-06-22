'use client';

import { useCallback, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { WooCommerceProduct } from '../lib/wordpress';

type SortOption = 'price-asc' | 'price-desc' | 'date-desc' | 'date-asc';

type ProductSection = {
  title: string;
  taxonomy: string;
  gridCols: string;
  products: WooCommerceProduct[];
};

const INITIAL_SECTIONS: ProductSection[] = [
  { title: 'Kĺbová výživa', taxonomy: '29', gridCols: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5', products: [] },
  { title: 'Akciové sety', taxonomy: '31', gridCols: 'grid-cols-1 md:grid-cols-2', products: [] },
  { title: 'Ďalšie produkty', taxonomy: '30', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', products: [] }
];

const SORT_OPTIONS = [
  { value: 'price-asc' as SortOption, label: 'Cena: od najnižšej' },
  { value: 'price-desc' as SortOption, label: 'Cena: od najvyššej' },
  { value: 'date-desc' as SortOption, label: 'Dátum: najnovšie' },
  { value: 'date-asc' as SortOption, label: 'Dátum: najstaršie' }
];

const sortProducts = (products: WooCommerceProduct[], sortBy: SortOption): WooCommerceProduct[] => {
  const sorted = [...products];
  
  const sortFunctions = {
    'price-asc': (a: WooCommerceProduct, b: WooCommerceProduct) => parseFloat(a.price) - parseFloat(b.price),
    'price-desc': (a: WooCommerceProduct, b: WooCommerceProduct) => parseFloat(b.price) - parseFloat(a.price),
    'date-desc': (a: WooCommerceProduct, b: WooCommerceProduct) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime(),
    'date-asc': (a: WooCommerceProduct, b: WooCommerceProduct) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
  };

  return sorted.sort(sortFunctions[sortBy]);
};

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse space-y-12">
      {INITIAL_SECTIONS.map((section, index) => (
        <div key={index}>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className={`grid ${section.gridCols} gap-6`}>
            {[...Array(5)].map((_, i) => (
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

const SortControls = ({ sortBy, onSortChange }: { sortBy: SortOption; onSortChange: (value: SortOption) => void }) => (
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-lg p-6 shadow-md border border-gray-100">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Naše produkty</h1>
      <p className="text-gray-600 text-sm">Objavte našu ponuku kĺbovej výživy</p>
    </div>
    
    <div className="flex items-center gap-3">
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Zoradiť podľa:
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default function ShopContent() {
  const [productSections, setProductSections] = useState<ProductSection[]>(INITIAL_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const fetchProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const sectionsWithProducts = await Promise.all(
        INITIAL_SECTIONS.map(async (section) => {
          try {
            const response = await fetch(`/api/woocommerce/products?taxonomy=${section.taxonomy}`);
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.message || `Failed to fetch products for category ${section.taxonomy}`);
            }
            return { ...section, products: data };
          } catch (sectionError) {
            console.error(`Error fetching section ${section.taxonomy}:`, sectionError);
            return { ...section, products: [] };
          }
        })
      );

      const hasAnyProducts = sectionsWithProducts.some(section => section.products.length > 0);
      if (!hasAnyProducts) {
        throw new Error('No products found in any category');
      }

      setProductSections(sectionsWithProducts);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    const sortedSections = productSections.map(section => ({
      ...section,
      products: sortProducts(section.products, newSortBy)
    }));
    setProductSections(sortedSections);
  };
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchProducts} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
      
      {productSections.map((section) => (
        section.products.length > 0 && (
          <section key={section.taxonomy} className="space-y-6">
            <h2 className="text-3xl font-bold">{section.title}</h2>
            <div className={`grid ${section.gridCols} gap-6`}>
              {section.products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isPriority={index < 3}
                />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
