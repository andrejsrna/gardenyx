import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // Adjust path if necessary
import type { WooCommerceProduct } from '../lib/wordpress'; // Adjust path if necessary
import { trackFbEvent } from './FacebookPixel';

interface ProductCardProps {
  product: WooCommerceProduct;
  isPriority?: boolean;
}

export default function ProductCard({ product, isPriority = false }: ProductCardProps) {
  const { addToCart, appliedCoupon, openCart } = useCart();

  const handleAddToCart = (product: WooCommerceProduct) => {
    // Track the add to cart event
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
      image: product.images[0]?.src || '',
      quantity: 1
    });
    openCart();
    // Consider adding a toast notification here for better UX
    // import { toast } from 'sonner';
    // toast.success(`${product.name} bol pridaný do košíka`);
  };

  const handleViewDetail = () => {
    trackFbEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: parseFloat(product.price),
      currency: 'EUR'
    });
  };

  const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price);
  const price = parseFloat(product.price);
  const regularPrice = parseFloat(product.regular_price);
  const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="aspect-[4/3] relative overflow-hidden">
        {product.images[0] && (
          <Link 
            href={`/produkt/${product.slug}`}
            onClick={handleViewDetail}
            className="block relative w-full h-full"
          >
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              priority={isPriority}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        )}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg z-10">
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <Link 
          href={`/produkt/${product.slug}`} 
          className="block group mb-2"
          onClick={handleViewDetail}
        >
          <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>

        <div
          className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow min-h-[2.5em]"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />

        <div className="mt-auto"> {/* Ensure price and buttons are at the bottom */}
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

          {appliedCoupon && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-2 mb-4 text-center">
              <p className="text-sm text-green-700">
                Kúpte so zľavovým kupónom
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/produkt/${product.slug}`}
              className="text-center px-4 py-2 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors duration-200 text-sm"
              onClick={handleViewDetail}
            >
              Detail
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              className="text-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              Kúpiť
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
