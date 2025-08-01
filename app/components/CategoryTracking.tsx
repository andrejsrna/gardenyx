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
    if (hasConsented && consent.analytics && products) {
      const convertedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        category: product.categories?.[0]?.name
      }));
      tracking.viewCategory(categoryName, convertedProducts);
    }
  }, [categoryName, products, hasConsented, consent.analytics]);

  return null;
} 