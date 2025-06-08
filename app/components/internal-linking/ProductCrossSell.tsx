'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, ArrowRight, Check } from 'lucide-react';

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

export default function ProductCrossSell({
  products,
  title = 'Odporúčané produkty',
  subtitle = 'Doplňte svoju kĺbovú výživu týmito produktmi',
  currentProductId,
  layout = 'grid',
  maxItems = 4,
  showFeatures = true,
  className = ''
}: ProductCrossSellProps) {
  const filteredProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, maxItems);

  if (filteredProducts.length === 0) return null;

  const layoutClasses = layout === 'horizontal' 
    ? 'flex overflow-x-auto gap-6 pb-4' 
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

  const cardClasses = layout === 'horizontal' 
    ? 'flex-shrink-0 w-80' 
    : '';

  return (
    <section className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 my-12 border border-green-100 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className={layoutClasses}>
        {filteredProducts.map((product) => (
          <article 
            key={product.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${cardClasses}`}
          >
            {product.isRecommended && (
              <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 text-center">
                ODPORÚČANÉ
              </div>
            )}
            
            {product.image && (
              <div className="aspect-[4/3] relative overflow-hidden">
                <Link href={`/produkt/${product.slug}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                {product.savings && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.savings}
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              <Link href={`/produkt/${product.slug}`} className="group/title">
                <h3 className="font-bold text-lg mb-2 group-hover/title:text-green-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              {product.rating && (
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < product.rating! 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.rating}/5)
                  </span>
                </div>
              )}

              {showFeatures && product.features && (
                <ul className="space-y-1 mb-4">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">
                  {parseFloat(product.price).toFixed(2)} €
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/produkt/${product.slug}`}
                  className="flex-1 text-center px-4 py-2 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                >
                  Detail
                </Link>
                <Link
                  href={`/produkt/${product.slug}#buy`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Kúpiť
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/kupit"
          className="inline-flex items-center px-6 py-3 bg-white border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors"
        >
          Zobraziť všetky produkty
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </section>
  );
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