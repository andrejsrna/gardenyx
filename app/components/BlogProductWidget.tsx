'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { WooCommerceProduct } from '../lib/wordpress';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface BlogProductWidgetProps {
  productIds: number[];
}

export default function BlogProductWidget({ productIds }: BlogProductWidgetProps) {
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mountPoint, setMountPoint] = useState<Element | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // Find the mount point in the document
    const point = document.getElementById('product-widget-mount-point');
    if (point) {
      setMountPoint(point);
    }
  }, []);

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
        ).filter(Boolean);
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [productIds]);

  const content = (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 shadow-lg border border-green-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Odporúčané produkty pre vás
        </h3>
        <p className="text-gray-600">
          Vybrali sme pre vás produkty, ktoré vám pomôžu s vašimi problémami
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
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
                    <Link href={`/produkt/${product.slug}`}>
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
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
                    <span>Kúpiť</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

  if (!mountPoint) {
    return null;
  }

  return createPortal(content, mountPoint);
} 