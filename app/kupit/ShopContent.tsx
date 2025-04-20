'use client';

import { useCallback, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { WooCommerceProduct } from '../lib/wordpress';

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

export default function ShopContent() {
  const [productSections, setProductSections] = useState<ProductSection[]>(INITIAL_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const updatedSections = await Promise.all(
        INITIAL_SECTIONS.map(async (section) => {
          try {
            const response = await fetch(`/api/woocommerce/products?taxonomy=${section.taxonomy}`);
            const data = await response.json();

            if (!response.ok) {
              console.error('API Error Response:', data);
              throw new Error(data.message || `Failed to fetch products for category ${section.taxonomy}`);
            }

            // Sort products by price in ascending order
            const sortedData = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            return { ...section, products: sortedData };
          } catch (sectionError) {
            console.error(`Error fetching section ${section.taxonomy}:`, sectionError);
            return { ...section, products: [] }; // Return empty products for failed section
          }
        })
      );

      // Check if any sections have products
      const hasAnyProducts = updatedSections.some(section => section.products.length > 0);
      if (!hasAnyProducts) {
        throw new Error('No products found in any category');
      }

      setProductSections(updatedSections);
    } catch (error) {
      console.error('Shop content error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Niečo sa pokazilo</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Skúsiť znova
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-12">
          {productSections.map((section, index) => (
            <div key={index}>
               <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
               <div className={`grid ${section.gridCols} gap-6`}>
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {productSections.map((section) => (
        section.products.length > 0 && (
          <section key={section.taxonomy} className="space-y-6">
            <h2 className="text-3xl font-bold">{section.title}</h2>
            <div className={`grid ${section.gridCols} gap-6`}>
              {section.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
