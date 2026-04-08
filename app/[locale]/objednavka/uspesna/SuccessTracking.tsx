'use client';

import { useEffect } from 'react';
import { tracking } from '../../../lib/tracking';
import { reportPurchaseConversion } from '../../../components/GoogleAds';

type SuccessTrackingProps = {
  orderId: string;
  total: number;
  tax?: number;
  shipping?: number;
  items: Array<{ id: string | number; name: string; price: number; quantity: number; category?: string }>
};

export default function SuccessTracking({ orderId, total, tax, shipping, items }: SuccessTrackingProps) {
  useEffect(() => {
    if (!orderId) return;
    const key = `purchase_tracked_${orderId}`;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(key) === 'true') return;

    try { console.debug('[tracking] purchase (success page)', orderId); } catch {}

    void (async () => {
      try {
        await tracking.purchaseWithConversionAPI(orderId, items, total, undefined, tax, shipping);
        reportPurchaseConversion({ value: total, transactionId: orderId });
        sessionStorage.setItem(key, 'true');
      } catch {
        // ignore
      }
    })();
  }, [orderId, total, tax, shipping, items]);

  return null;
}
