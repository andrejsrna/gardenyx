'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { WooCommerceProduct } from '../lib/wordpress';
import { toast } from 'sonner';

interface BlogProductWidgetProps {
  productIds: number[];
  title?: string;
  description?: string;
}

export default function BlogProductWidget({ productIds, title, description }: BlogProductWidgetProps) {
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/woocommerce/products?include=${productIds.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        // Filter products to only include the ones we specified
        const filteredProducts = data.filter((product: WooCommerceProduct) => 
          productIds.includes(product.id)
        );
        // Sort products to match the order of productIds
        const sortedProducts = productIds.map(id => 
          filteredProducts.find((p: WooCommerceProduct) => p.id === id)
        ).filter(p => p !== undefined) as WooCommerceProduct[];
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productIds.length > 0) {
      fetchProducts();
    } else {
      setIsLoading(false);
    }
  }, [productIds]);

  if (products.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 shadow-lg border border-green-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title || 'Odporúčané produkty pre vás'}
        </h3>
        <p className="text-gray-600">
          {description || 'Vybrali sme pre vás produkty, ktoré vám pomôžu s vašimi problémami'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(productIds.length || 3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => {
            if (!product) return null;
            const price = parseFloat(product.price);
            const hasDiscount = product.sale_price !== '';
            const regularPrice = parseFloat(product.regular_price);

            return (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="aspect-square relative">
                  {product.images[0] && (
                    <Link href={`/produkt/${product.slug}`} className="block relative w-full h-full">
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-4"
                      />
                    </Link>
                  )}
                </div>
                <div className="p-4">
                  <Link 
                    href={`/produkt/${product.slug}`}
                    className="block group"
                  >
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
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

                  <button
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: price,
                        image: product.images[0]?.src,
                        quantity: 1
                      });
                      toast.success('Produkt bol pridaný do košíka');
                    }}
                    className="w-full text-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Do košíka</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 
