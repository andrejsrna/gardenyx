'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { WooCommerceProduct } from '../lib/wordpress';

export default function Toast() {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<WooCommerceProduct | null>(null);

  useEffect(() => {
    // Fetch products once when component mounts
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/woocommerce/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    const showRandomToast = () => {
      if (products.length === 0) return;

      const randomProduct = products[Math.floor(Math.random() * products.length)];
      setCurrentProduct(randomProduct);
      setIsVisible(true);

      // Hide toast after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        
        // Schedule next toast after random interval (30-60 seconds)
        const nextDelay = Math.random() * (60000 - 30000) + 30000;
        setTimeout(showRandomToast, nextDelay);
      }, 5000);
    };

    // Initial delay before first toast
    const initialDelay = setTimeout(showRandomToast, 15000);
    return () => clearTimeout(initialDelay);
  }, [products]);

  if (!isVisible || !currentProduct) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-up">
      <Link 
        href={`/produkt/${currentProduct.slug}`}
        className="block"
      >
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-4">
            {currentProduct.images[0] && (
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={currentProduct.images[0].src}
                  alt={currentProduct.name}
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                <span>Niekto si nedávno kúpil </span>
                <span className="font-semibold text-gray-900">{currentProduct.name}</span>
              </div>
              <div className="text-sm font-medium text-green-600 mt-1">
                {currentProduct.price}€
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsVisible(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
} 