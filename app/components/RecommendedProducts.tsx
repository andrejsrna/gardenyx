'use client';

import CureBundlesSection from '@/app/components/CureBundlesSection';
import type { Product } from '../lib/content-types';

interface RecommendedProductsProps {
  products: Product[];
}

export default function RecommendedProducts(_props: RecommendedProductsProps) {
  return <CureBundlesSection buttonText="Zobraziť všetky produkty" />;
} 
