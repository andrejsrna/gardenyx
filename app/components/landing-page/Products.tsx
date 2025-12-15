'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../../lib/content-types';
import { getProducts } from '../../lib/orders';
import ProductCard from '../ProductCard'; // Import the shared ProductCard component

const DEFAULT_PRODUCT_IDS = [47, 49, 24, 27, 30];

type ProductsProps = {
  productIds?: number[];
  title?: string;
  description?: string;
  gridClassName?: string;
  loadingGridClassName?: string;
};

export default function Products({
  productIds = DEFAULT_PRODUCT_IDS,
  title = 'Naša odporúčaná kĺbová výživa',
  description,
  gridClassName = 'grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  loadingGridClassName = 'animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
}: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const includeIds = useMemo(() => {
    if (!productIds.length) return '';
    return [...productIds].join(',');
  }, [productIds]);

  const loadingPlaceholderCount = productIds.length > 0 ? productIds.length : DEFAULT_PRODUCT_IDS.length;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch products by specific IDs using the 'include' parameter
        const data = includeIds ? await getProducts({ include: includeIds }) : await getProducts();

        const orderMap = new Map(productIds.map((id, index) => [id, index]));

        // Optional: Sort the specific products if needed (e.g., by the order in productIds)
        const sortedData = [...data].sort((a, b) => {
          const indexA = orderMap.get(a.id);
          const indexB = orderMap.get(b.id);
          if (indexA === undefined && indexB === undefined) return 0;
          if (indexA === undefined) return 1;
          if (indexB === undefined) return -1;
          return indexA - indexB; // Sort by the predefined order
        });

        // Or sort by price if preferred:
        // const sortedData = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        setProducts(sortedData);

      } catch (fetchError) {
        console.error('Landing page products fetch error:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [includeIds, productIds]);

  return (
    <section id="produkty" className="py-16 md:py-24 bg-gray-50"> {/* Section background */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">{title}</h2>
        {description && (
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-gray-600">
            {description}
          </p>
        )}

        {isLoading && (
          // Updated grid to match the number of products (5)
          <div className={loadingGridClassName}>
            {[...Array(loadingPlaceholderCount)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
            ))}
          </div>
        )}

        {error && (
           <div className="text-center text-red-600">
             <p>Chyba pri načítaní produktov: {error}</p>
             {/* Optional: Add a retry button */}
           </div>
        )}

        {!isLoading && !error && products.length === 0 && (
           <div className="text-center text-gray-600">
             <p>Požadované produkty sa nepodarilo nájsť.</p> {/* Updated message */}
           </div>
        )}

        {!isLoading && !error && products.length > 0 && (
           // Updated grid to better accommodate 5 products
          <div className={gridClassName}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} isPriority={index === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
