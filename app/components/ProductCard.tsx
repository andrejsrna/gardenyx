import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // Adjust path if necessary
import type { WooCommerceProduct } from '../lib/wordpress'; // Adjust path if necessary
import { tracking } from '../lib/tracking';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '../lib/utils/sales-suspension';

interface ProductCardProps {
  product: WooCommerceProduct;
  isPriority?: boolean;
}

export default function ProductCard({ product, isPriority = false }: ProductCardProps) {
  const { addToCart, appliedCoupon, openCart } = useCart();

  const handleAddToCart = (product: WooCommerceProduct) => {
    // Check if sales are suspended
    if (isSalesSuspendedClient()) {
      const message = getSalesSuspensionMessageClient();
      alert(message);
      return;
    }

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
      image: product.images[0]?.src || '',
      quantity: 1
    });
    openCart();
  };

  const handleViewDetail = () => {
    tracking.viewContent({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1
    });
  };

  const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price);
  const price = parseFloat(product.price);
  const regularPrice = parseFloat(product.regular_price);
  const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;
  const isSalesSuspended = isSalesSuspendedClient();

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

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-800">
              {price.toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-base text-gray-500 line-through">
                {regularPrice.toFixed(2)} €
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/produkt/${product.slug}`}
              onClick={handleViewDetail}
              className="text-center w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm"
            >
              Detail produktu
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              disabled={isSalesSuspended}
              className={`text-center w-full px-4 py-3 font-semibold rounded-lg transition-colors duration-200 text-sm shadow-md ${
                isSalesSuspended 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {isSalesSuspended ? 'Predaje pozastavené' : 'Pridať do košíka'}
            </button>
            {appliedCoupon && (
              <span className="text-xs text-green-700 text-center -mt-2">so zľavovým kupónom</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
