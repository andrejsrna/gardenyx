'use client';

import { useEffect } from 'react';
import { tracking } from '../../lib/tracking';
import { WooCommerceProduct } from '../../lib/wordpress';

interface ProductTrackingProps {
  product: WooCommerceProduct;
}

export default function ProductTracking({ product }: ProductTrackingProps) {
  useEffect(() => {
    tracking.viewContent({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      category: product.categories?.[0]?.name,
    });
  }, [product]);

  return null;
} 