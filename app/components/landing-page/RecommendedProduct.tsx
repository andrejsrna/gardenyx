'use client';

import { useEffect, useState } from 'react';
import type { WooCommerceProduct } from '../../lib/wordpress';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { tracking } from '../../lib/tracking';

const RECOMMENDED_PRODUCT_ID = 824;

export default function RecommendedProduct() {
  const [product, setProduct] = useState<WooCommerceProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, appliedCoupon, openCart } = useCart();

  const handleAddToCart = (p: WooCommerceProduct) => {
    tracking.addToCart({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      quantity: 1
    });

    addToCart({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      image: p.images[0]?.src || '',
      quantity: 1
    });
    openCart();
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/woocommerce/products?include=${RECOMMENDED_PRODUCT_ID}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Nepodarilo sa načítať odporúčaný produkt');
        }

        setProduct(Array.isArray(data) ? data[0] ?? null : null);
      } catch (err) {
        console.error('Recommended product fetch error:', err);
        setError(err instanceof Error ? err.message : 'Chyba pri načítaní produktu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, []);

  return (
    <section id="odporucany-produkt" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Odporúčaný produkt
        </h2>

        {isLoading && (
          <div className="animate-pulse max-w-5xl mx-auto">
            <div className="bg-gray-200 rounded-xl h-96" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && product && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative w-full aspect-[4/3] bg-white rounded-xl shadow-md overflow-hidden">
                {product.images[0] && (
                  <Link href={`/produkt/${product.slug}`} className="block relative w-full h-full"
                    onClick={() => tracking.viewContent({ id: product.id, name: product.name, price: parseFloat(product.price), quantity: 1 })}
                  >
                    <Image
                      src={product.images[0].src}
                      alt={product.images[0].alt || product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-6"
                    />
                  </Link>
                )}
                {(() => {
                  const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price);
                  if (!hasDiscount) return null;
                  const price = parseFloat(product.price);
                  const regularPrice = parseFloat(product.regular_price);
                  const discount = Math.round((1 - price / regularPrice) * 100);
                  return (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg z-10">
                      -{discount}%
                    </div>
                  );
                })()}
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h3>

                {(() => {
                  const price = parseFloat(product.price);
                  const regularPrice = parseFloat(product.regular_price);
                  const hasDiscount = product.sale_price && price < regularPrice;
                  const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;
                  return (
                    <div className="mb-6">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-extrabold text-gray-900">{price.toFixed(2)} €</span>
                        {hasDiscount && (
                          <span className="text-lg text-gray-500 line-through">{regularPrice.toFixed(2)} €</span>
                        )}
                      </div>
                      {hasDiscount && (
                        <p className="text-green-700 font-medium mt-1">Aktuálna zľava -{discount}%</p>
                      )}
                    </div>
                  );
                })()}

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Prečo ho odporúčame</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Výborná cena v pomere k zloženiu</li>
                    {(() => {
                      const price = parseFloat(product.price);
                      const regularPrice = parseFloat(product.regular_price);
                      const hasDiscount = product.sale_price && price < regularPrice;
                      if (!hasDiscount) return null;
                      const discount = Math.round((1 - price / regularPrice) * 100);
                      return <li>Aktuálna akcia: -{discount}% oproti bežnej cene</li>;
                    })()}
                    <li>Rýchle objednanie a doručenie</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/produkt/${product.slug}`}
                    onClick={() => tracking.viewContent({ id: product.id, name: product.name, price: parseFloat(product.price), quantity: 1 })}
                    className="text-center w-full sm:w-auto px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Detail produktu
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-center w-full sm:w-auto px-5 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                  >
                    Pridať do košíka
                  </button>
                </div>
                {appliedCoupon && (
                  <span className="block text-xs text-green-700 mt-2">so zľavovým kupónom</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


