'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
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
  const { addToCart, appliedCoupon } = useCart();

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

  const handleAddToCart = (product: WooCommerceProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images[0]?.src || '',
      quantity: 1
    });
  };

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
            <div key={index} className={`grid ${section.gridCols} gap-6`}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ProductCard = ({ product }: { product: WooCommerceProduct }) => {
    const hasDiscount = product.sale_price !== '';
    const price = parseFloat(product.price);
    const regularPrice = parseFloat(product.regular_price);
    const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;

    return (
      <article className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-[4/3] relative overflow-hidden">
          {product.images[0] && (
            <Link href={`/produkt/${product.slug}`}>
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          )}
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
              -{discount}%
            </div>
          )}
        </div>
        <div className="p-6">
          <Link href={`/produkt/${product.slug}`} className="block group">
            <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
          </Link>

          <div
            className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-green-600">
              {price.toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {regularPrice.toFixed(2)} €
              </span>
            )}
          </div>

          {appliedCoupon && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-2 mb-4 text-center">
              <p className="text-sm text-green-700">
                Kúpte so zľavovým kupónom
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/produkt/${product.slug}`}
              className="text-center px-4 py-2 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors"
            >
              Detail
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              className="text-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Kúpiť
            </button>
          </div>
        </div>
      </article>
    );
  };

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
