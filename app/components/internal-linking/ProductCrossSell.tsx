'use client';

import CureBundlesSection from '@/app/components/CureBundlesSection';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  image?: string;
  rating?: number;
  features?: string[];
  isRecommended?: boolean;
  savings?: string;
}

interface ProductCrossSellProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  currentProductId?: number;
  layout?: 'horizontal' | 'grid';
  maxItems?: number;
  showFeatures?: boolean;
  className?: string;
}

export default function ProductCrossSell(_props: ProductCrossSellProps) {
  return <CureBundlesSection buttonText="Zobraziť všetky produkty" />;
}

// Helper function to create mock products for demonstration
export function createMockProducts(): Product[] {
  return [
    {
      id: 1,
      name: 'Najsilnejšia kĺbová výživa',
      slug: 'najsilnejsia-klbova-vyziva',
      price: '29.90',
      image: '/images/product-main.jpg',
      rating: 5,
      features: ['9 prírodných zložiek', 'Klinicky testované', 'Bez GMO'],
      isRecommended: true,
      savings: '-20%'
    },
    {
      id: 2,
      name: 'Kolagén Plus',
      slug: 'kolagen-plus',
      price: '24.90',
      image: '/images/product-collagen.jpg',
      rating: 4,
      features: ['Morský kolagén', 'Vitamín C', 'Kyselina hyaluronová'],
    },
    {
      id: 3,
      name: 'MSM Ultra',
      slug: 'msm-ultra',
      price: '19.90',
      image: '/images/product-msm.jpg',
      rating: 4,
      features: ['Čistý MSM', 'Protizápalové účinky', 'Vysoká dostupnosť'],
    }
  ];
} 