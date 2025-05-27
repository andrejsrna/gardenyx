'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { WooCommerceProduct } from '../lib/wordpress';
import { trackFbEvent } from './FacebookPixel';

interface RecommendedProductsProps {
  products: WooCommerceProduct[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (product: WooCommerceProduct) => {
    // Track the add to cart event with Facebook Pixel
    trackFbEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: parseFloat(product.price),
      currency: 'EUR'
    });

    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images[0]?.src,
      quantity: 1,
    });

    toast.success('Produkt pridaný do košíka', {
      description: (
        <div className="flex gap-3 mt-2">
          {product.images[0]?.src && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
              <Image
                src={product.images[0].src}
                alt={product.name}
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="font-medium text-gray-900 leading-snug line-clamp-2">
              {product.name}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {parseFloat(product.price).toFixed(2)} €
            </p>
          </div>
        </div>
      ),
      action: {
        label: "Zobraziť košík",
        onClick: () => {
          const button = document.querySelector('[data-cart-button]') as HTMLButtonElement;
          button?.click();
        },
      },
      duration: 5000,
      className: 'max-w-md',
    });
  };

  const handleViewDetail = (product: WooCommerceProduct) => {
    trackFbEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: parseFloat(product.price),
      currency: 'EUR'
    });
  };

  if (!products.length) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Odporúčané produkty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const hasDiscount = product.sale_price !== '';
            const price = parseFloat(product.price);
            const regularPrice = parseFloat(product.regular_price);
            const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;

            return (
              <article 
                key={product.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  {product.images[0] && (
                    <Link 
                      href={`/produkt/${product.slug}`}
                      onClick={() => handleViewDetail(product)}
                      className="block relative w-full h-full"
                    >
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      -{discount}%
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <Link 
                    href={`/produkt/${product.slug}`} 
                    className="block group"
                    onClick={() => handleViewDetail(product)}
                  >
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  <div 
                    className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {price.toFixed(2)} €
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        {regularPrice.toFixed(2)} €
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <Link 
                      href={`/produkt/${product.slug}`}
                      className="text-center px-4 py-2 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                      onClick={() => handleViewDetail(product)}
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Kúpiť
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
} 