'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { WooCommerceProduct } from '@/app/lib/wordpress';
import { toast } from 'sonner';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface AddToCartButtonProps {
  product: WooCommerceProduct;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images[0]?.src || '',
      quantity: quantity
    });

    toast.success('Produkt pridaný do košíka', {
      description: (
        <div className="flex gap-3 mt-2">
          {product.images[0]?.src && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
              <Image
                src={product.images[0].src}
                alt={product.name}
                fill
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="font-medium text-gray-900 leading-snug line-clamp-2">
              {product.name}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {parseFloat(product.price).toFixed(2)} €
            </p>
          </div>
        </div>
      ),
      action: {
        label: "Zobraziť košík",
        onClick: () => {
          const button = document.querySelector('[data-cart-button]') as HTMLButtonElement;
          button?.click();
        },
      },
      duration: 5000,
      className: 'max-w-md',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border-2 rounded-lg bg-white">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-3 text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Znížiť množstvo"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="p-3 text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Zvýšiť množstvo"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="flex-1 px-8 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Pridať do košíka</span>
        </button>
      </div>

      <div className="text-sm text-center text-gray-500">
        Na sklade: <span className="font-medium text-green-600">Dostupné</span>
      </div>
    </div>
  );
} 