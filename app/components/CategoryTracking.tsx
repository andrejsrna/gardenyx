'use client';

import { useEffect } from 'react';
import { tracking } from '../lib/tracking';
import type { Product } from '../lib/content-types';

interface CategoryTrackingProps {
  categoryName: string;
  products?: Product[];
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
