'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { WooCommerceProduct } from '../lib/wordpress';

export default function ShopContent() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/woocommerce/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: WooCommerceProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images[0]?.src || '',
      quantity: 1
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Všetky produkty</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const hasDiscount = product.sale_price !== '';
          const price = parseFloat(product.price);
          const regularPrice = parseFloat(product.regular_price);
          const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;

          return (
            <article 
              key={product.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300"
            >
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
        })}
      </div>
    </div>
  );
} 