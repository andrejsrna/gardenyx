'use client';

import { useEffect, useRef } from 'react';
import { FREE_SHIPPING_THRESHOLD } from '../../lib/checkout/constants';
import { tracking } from '../../lib/tracking';

interface FreeShippingProgressProps {
  totalPrice: number;
}

export default function FreeShippingProgress({ totalPrice }: FreeShippingProgressProps) {
  const hasTrackedFreeShipping = useRef(false);

  // Track when free shipping threshold is reached
  useEffect(() => {
    if (totalPrice >= FREE_SHIPPING_THRESHOLD && !hasTrackedFreeShipping.current) {
      tracking.custom('free_shipping_threshold', {
        value: totalPrice,
        threshold: FREE_SHIPPING_THRESHOLD
      });
      hasTrackedFreeShipping.current = true;
    } else if (totalPrice < FREE_SHIPPING_THRESHOLD) {
      // Reset tracking when price goes below threshold
      hasTrackedFreeShipping.current = false;
    }
  }, [totalPrice]);

  if (totalPrice >= FREE_SHIPPING_THRESHOLD) {
    return null;
  }

  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;
  const progress = (totalPrice / FREE_SHIPPING_THRESHOLD) * 100;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p className="text-green-700 mb-3">
        Nakúpte ešte za <span className="font-bold">{remaining.toFixed(2)} €</span> a máte dopravu zadarmo!
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-green-100 rounded-full h-3 mb-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-green-600">
        <span>{totalPrice.toFixed(2)} €</span>
        <span>{FREE_SHIPPING_THRESHOLD} €</span>
      </div>
    </div>
  );
} 