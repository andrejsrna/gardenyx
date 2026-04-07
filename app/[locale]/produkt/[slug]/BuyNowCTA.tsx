'use client';

import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '../../../../i18n/navigation';
import { useCart } from '@/app/context/CartContext';
import type { Product } from '@/app/lib/content-types';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '@/app/lib/utils/sales-suspension';

interface Props {
  product: Product;
}

export default function BuyNowCTA({ product }: Props) {
  const t = useTranslations('productPage');
  const router = useRouter();
  const { addToCart, closeCart } = useCart();
  const isSalesSuspended = isSalesSuspendedClient();

  const handleBuyNow = () => {
    // Check if sales are suspended
    if (isSalesSuspendedClient()) {
      const message = getSalesSuspensionMessageClient();
      alert(message);
      return;
    }

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
        disabled={isSalesSuspended}
        className={`inline-flex items-center gap-2 px-8 py-4 text-lg font-medium rounded-full transition-colors ${
          isSalesSuspended 
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
            : 'text-white bg-green-600 hover:bg-green-700'
        }`}
      >
        <CreditCard className="w-5 h-5" />
        {isSalesSuspended ? t('actions.salesSuspended') : t('actions.buyNowCheckout')}
      </button>
    </div>
  );
}
