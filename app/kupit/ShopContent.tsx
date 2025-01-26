'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const updatedSections = await Promise.all(
        INITIAL_SECTIONS.map(async (section) => {
          console.log(`[Shop] Fetching products for ${section.taxonomy}`);
          const response = await fetch(`/api/woocommerce/products?taxonomy=${section.taxonomy}`);
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to fetch ${section.taxonomy} products`);
          }
          const data = await response.json();
          // Sort products by price in ascending order
          const sortedData = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          console.log(`[Shop] Found ${data.length} products for ${section.taxonomy}`);
          return { ...section, products: sortedData };
        })
      );
      setProductSections(updatedSections);
    } catch (error) {
      console.error('[Shop] Error fetching products:', error);
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
              {[...Array(4)].map((_, i) => (
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