'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { WooCommerceProduct } from '../lib/wordpress';
import { tracking } from '../lib/tracking';

interface RecommendedProductsProps {
  products: WooCommerceProduct[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (product: WooCommerceProduct) => {
    tracking.addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1
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
    tracking.viewContent({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1
    });
  };

  if (!products.length) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold">Odporúčané produkty</h2>
          <Link
            href="/kupit"
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Prejsť do obchodu
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const isHero = product.id === 824;
            const price = parseFloat(product.price);
            const regularPrice = parseFloat(product.regular_price);
            const salePrice = parseFloat(product.sale_price || 'NaN');
            const hasDiscount = Number.isFinite(salePrice) && salePrice < regularPrice;
            const effectivePrice = Number.isFinite(salePrice) ? salePrice : price;
            const discount = hasDiscount ? Math.round((1 - effectivePrice / regularPrice) * 100) : 0;
            const qualifiesFreeShippingBadge = effectivePrice > 29;

            return (
              <article
                key={product.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 ${isHero ? 'ring-2 ring-green-500 transform md:-translate-y-2' : ''}`}
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
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  )}
                  {isHero && (
                    <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-br-xl text-sm font-bold shadow-md z-10">
                      Najpredávanejšie
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      -{discount}%
                    </div>
                  )}
                  {qualifiesFreeShippingBadge && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      Doprava zadarmo
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
                      className={`text-center px-4 py-2 border-2 font-medium rounded-lg transition-colors ${isHero ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100' : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'}`}
                      onClick={() => handleViewDetail(product)}
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`text-center px-6 py-2 font-medium rounded-lg transition-colors ${isHero ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
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
