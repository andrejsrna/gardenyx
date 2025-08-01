'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';
import { tracking } from '../../lib/tracking';
import { WooCommerceProduct } from '../../lib/wordpress';

interface ProductTrackingProps {
  product: WooCommerceProduct;
}

export default function ProductTracking({ product }: ProductTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    // Check both analytics (for GA) and marketing (for FB Pixel) consent
    if (hasConsented && (consent.analytics || consent.marketing)) {
      tracking.viewContent({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        category: product.categories?.[0]?.name,
      });
    }
  }, [product, hasConsented, consent.analytics, consent.marketing]);

  return null;
} 