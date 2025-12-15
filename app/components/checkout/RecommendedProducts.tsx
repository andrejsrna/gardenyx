'use client';

import Image from 'next/image';
import type { Product } from '../../lib/content-types';
import { FREE_SHIPPING_THRESHOLD } from '../../lib/checkout/constants';

interface RecommendedProductsProps {
  totalPrice: number;
  recommendedProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export default function RecommendedProducts({
  totalPrice,
  recommendedProducts,
  onAddToCart,
}: RecommendedProductsProps) {
  if (totalPrice >= FREE_SHIPPING_THRESHOLD || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Tieto produkty by vás mohli zaujať</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendedProducts.map((product) => (
          <div key={product.id} className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-2">
              <Image
                src={product.images?.[0]?.src || '/placeholder.png'}
                alt={product.images?.[0]?.alt || product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain"
              />
            </div>
            <h3 className="text-sm font-medium mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-sm font-bold text-green-600 mb-2">{product.price} €</p>
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
            >
              Pridať do košíka
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 
