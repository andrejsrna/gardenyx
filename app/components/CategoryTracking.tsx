'use client';

import { useEffect } from 'react';
import { tracking } from '../lib/tracking';
import { WooCommerceProduct } from '../lib/wordpress';

interface CategoryTrackingProps {
  categoryName: string;
  products?: WooCommerceProduct[];
}

export default function CategoryTracking({ categoryName, products }: CategoryTrackingProps) {
  useEffect(() => {
    if (products) {
      const mappedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        category: categoryName,
      }));

      tracking.viewCategory(categoryName, mappedProducts);
    }
  }, [categoryName, products]);

  return null;
} 