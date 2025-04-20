'use client';

import { useEffect, useState } from 'react';
import type { WooCommerceProduct } from '../../lib/wordpress';
import ProductCard from '../ProductCard'; // Import the shared ProductCard component

// Define the specific product IDs to display
const LANDING_PAGE_PRODUCT_IDS = [47, 49, 24, 27, 30];

export default function Products() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch products by specific IDs using the 'include' parameter
        const includeIds = LANDING_PAGE_PRODUCT_IDS.join(',');
        const response = await fetch(`/api/woocommerce/products?include=${includeIds}`);
        const data = await response.json();

        if (!response.ok) {
          console.error('API Error Response:', data);
          throw new Error(data.message || `Failed to fetch products with IDs: ${includeIds}`);
        }

        // Optional: Sort the specific products if needed (e.g., by the order in LANDING_PAGE_PRODUCT_IDS)
        const sortedData = [...data].sort((a, b) => {
          const indexA = LANDING_PAGE_PRODUCT_IDS.indexOf(a.id);
          const indexB = LANDING_PAGE_PRODUCT_IDS.indexOf(b.id);
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
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-50"> {/* Section background */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Naša Odporúčaná Kĺbová Výživa
        </h2>

        {isLoading && (
          // Updated grid to match the number of products (5)
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(LANDING_PAGE_PRODUCT_IDS.length)].map((_, i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
