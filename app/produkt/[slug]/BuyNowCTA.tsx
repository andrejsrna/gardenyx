'use client';

import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import type { WooCommerceProduct } from '@/app/lib/wordpress';

interface Props {
  product: WooCommerceProduct;
}

export default function BuyNowCTA({ product }: Props) {
  const router = useRouter();
  const { addToCart, closeCart } = useCart();

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images[0]?.src || '',
      quantity: 1,
    });
    closeCart();
    router.push('/pokladna');
  };

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={handleBuyNow}
        className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
      >
        <CreditCard className="w-5 h-5" />
        Kúpiť teraz – prejsť do pokladne
      </button>
    </div>
  );
}


