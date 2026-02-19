'use client';

import CureBundlesSection from '@/app/components/CureBundlesSection';
import type { Product } from '../../lib/content-types';

interface RecommendedProductsProps {
  totalPrice: number;
  recommendedProducts: Product[];
  onAddToCart: (product: Product) => void;
}

// Note: The old recommended-products UI was replaced with CureBundlesSection.
// We keep the props for backwards compatibility with CheckoutClient.

export default function RecommendedProducts(_props: RecommendedProductsProps) {
  // Checkout: show cures instead of per-product cross-sell.
  return <CureBundlesSection buttonText="Zobraziť všetky produkty" />;
}
