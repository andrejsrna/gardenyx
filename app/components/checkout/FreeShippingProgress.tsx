'use client';

import { useEffect, useRef } from 'react';
import { FREE_SHIPPING_THRESHOLD } from '../../lib/checkout/constants';
import { tracking } from '../../lib/tracking';

interface FreeShippingProgressProps {
  totalPrice?: number; // kept for backward compatibility (after discount)
  subtotal?: number;   // preferred: before discount
  couponFreeShipping?: boolean;
}

export default function FreeShippingProgress({ totalPrice = 0, subtotal, couponFreeShipping = false }: FreeShippingProgressProps) {
  const hasTrackedFreeShipping = useRef(false);

  const effectiveSubtotal = typeof subtotal === 'number' ? subtotal : totalPrice;
  const hasFreeShipping = couponFreeShipping || effectiveSubtotal >= FREE_SHIPPING_THRESHOLD;

  // Track when free shipping threshold is reached (only when it is reached by subtotal, not by coupon)
  useEffect(() => {
    if (couponFreeShipping) return;
    if (effectiveSubtotal >= FREE_SHIPPING_THRESHOLD && !hasTrackedFreeShipping.current) {
      tracking.custom('free_shipping_threshold', {
        value: effectiveSubtotal,
        threshold: FREE_SHIPPING_THRESHOLD
      });
      hasTrackedFreeShipping.current = true;
    } else if (effectiveSubtotal < FREE_SHIPPING_THRESHOLD) {
      // Reset tracking when price goes below threshold
      hasTrackedFreeShipping.current = false;
    }
  }, [effectiveSubtotal, couponFreeShipping]);

  if (hasFreeShipping) {
    return null;
  }

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - effectiveSubtotal);
  const progress = (effectiveSubtotal / FREE_SHIPPING_THRESHOLD) * 100;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p className="text-green-700 mb-3">
        Nakúpte ešte za <span className="font-bold">{remaining.toFixed(2)} €</span> a získate dopravu zdarma.
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
