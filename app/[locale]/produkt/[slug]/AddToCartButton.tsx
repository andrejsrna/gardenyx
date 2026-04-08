'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/app/context/CartContext';
import { Product } from '@/app/lib/content-types';
import type { ProductVariant } from '@/app/lib/products';
import { tracking } from '@/app/lib/tracking';
import { toast } from 'sonner';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '@/app/lib/utils/sales-suspension';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const t = useTranslations('productPage');
  const { addToCart } = useCart();
  const isSalesSuspended = isSalesSuspendedClient();

  const variants: ProductVariant[] = (product.variants ?? []).filter(
    (v) => v.stockStatus !== 'outofstock',
  );
  const isVariable = product.type === 'variable' && variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    isVariable ? variants[0] : null,
  );

  const effectivePrice = selectedVariant ? selectedVariant.price : parseFloat(product.price);

  const handleAddToCart = () => {
    if (isSalesSuspended) {
      toast.error(getSalesSuspensionMessageClient());
      return;
    }

    const name = selectedVariant
      ? `${product.name} – ${selectedVariant.name}`
      : product.name;
    const sku = selectedVariant?.sku ?? product.sku ?? undefined;

    tracking.addToCart({
      id: product.id,
      name,
      price: effectivePrice,
      quantity,
    });

    addToCart({
      id: product.id,
      name,
      price: effectivePrice,
      image: product.images[0]?.src || '',
      quantity,
      sku: sku ?? undefined,
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
                sizes="64px"
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="font-medium text-gray-900 leading-snug line-clamp-2">{name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{effectivePrice.toFixed(2)} €</p>
          </div>
        </div>
      ),
      action: {
        label: 'Zobraziť košík',
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
    <div className="space-y-4">
      {isVariable && (
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">{t('variant.label')}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                  selectedVariant?.id === v.id
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-green-400'
                }`}
              >
                {v.name}
                <span className="ml-1.5 text-stone-500">{v.price.toFixed(2)} €</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center border-2 rounded-lg bg-white justify-between">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={isSalesSuspended}
          className={`p-3 transition-colors ${
            isSalesSuspended ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-green-600'
          }`}
          aria-label={t('quantity.decrease')}
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-center font-semibold text-lg">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          disabled={isSalesSuspended}
          className={`p-3 transition-colors ${
            isSalesSuspended ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-green-600'
          }`}
          aria-label={t('quantity.increase')}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <button
        id="add-to-cart-top"
        onClick={handleAddToCart}
        disabled={isSalesSuspended}
        className={`w-full px-8 py-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-lg ${
          isSalesSuspended
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        <ShoppingCart className="w-6 h-6" />
        <span>{isSalesSuspended ? t('actions.salesSuspended') : t('actions.addToCart')}</span>
      </button>

      <div className="text-sm text-center text-gray-500">
        {t('stock.label')}: <span className="font-medium text-green-600">{t('stock.available')}</span>
      </div>
    </div>
  );
}
