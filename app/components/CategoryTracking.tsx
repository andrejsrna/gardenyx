'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';
import { tracking } from '../lib/tracking';
import { WooCommerceProduct } from '../lib/wordpress';

interface CategoryTrackingProps {
  categoryName: string;
  products?: WooCommerceProduct[];
}

export default function CategoryTracking({ categoryName, products }: CategoryTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    // Check both analytics (for GA) and marketing (for FB Pixel) consent
    if (hasConsented && (consent.analytics || consent.marketing) && products) {
      const mappedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        category: categoryName,
      }));

      tracking.viewCategory(categoryName, mappedProducts);
    }
  }, [categoryName, products, hasConsented, consent.analytics, consent.marketing]);

  return null;
} 