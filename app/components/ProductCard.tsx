import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCart } from '../context/CartContext'; // Adjust path if necessary
import type { Product } from '../lib/content-types'; // Adjust path if necessary
import { tracking } from '../lib/tracking';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '../lib/utils/sales-suspension';
import { Link } from '../../i18n/navigation';

interface ProductCardProps {
  product: Product;
  locale?: string;
  isPriority?: boolean;
  isHero?: boolean;
}

export default function ProductCard({ product, locale: _locale, isPriority = false, isHero = false }: ProductCardProps) {
  const t = useTranslations('productCard');
  const { addToCart, appliedCoupon, openCart } = useCart();
  const productHref = { pathname: '/produkt/[slug]' as const, params: { slug: product.slug } };

  const handleAddToCart = (product: Product) => {
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
  const salePrice = parseFloat(product.sale_price || 'NaN');
  const effectivePrice = Number.isFinite(salePrice) ? salePrice : price;
  const isVariable = product.type === 'variable' && product.variants && product.variants.length > 0;
  const minVariantPrice = isVariable
    ? Math.min(...(product.variants ?? []).map((v) => v.price))
    : null;

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${isHero ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        {product.images[0] && (
          <Link
            href={productHref}
            onClick={handleViewDetail}
            className="block relative w-full h-full"
          >
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              priority={isPriority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </Link>
        )}
        {isHero && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-yellow-950 shadow-sm">
            {t('featured')}
          </div>
        )}
        {hasDiscount && (
          <div className="absolute right-4 top-4 z-10 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-lg">
            -{discount}%
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.categories[0] ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {product.categories[0].name}
          </p>
        ) : null}

        <Link
          href={productHref}
          className="mt-2 block"
          onClick={handleViewDetail}
        >
          <h3 className="line-clamp-2 min-h-[2.5em] text-xl font-semibold text-stone-900 transition-colors group-hover:text-emerald-700">
            {product.name}
          </h3>
        </Link>

        {product.short_description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
            {product.short_description}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          {isVariable && product.variants && product.variants.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    v.stockStatus === 'outofstock'
                      ? 'border-stone-200 bg-stone-50 text-stone-400 line-through'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {v.name}
                </span>
              ))}
            </div>
          )}

          <div className="mb-4 flex items-baseline gap-2">
            {isVariable && minVariantPrice !== null ? (
              <span className="text-2xl font-bold text-stone-900">
                {t('priceFrom')} {minVariantPrice.toFixed(2)} €
              </span>
            ) : (
              <>
                <span className="text-2xl font-bold text-stone-900">
                  {price.toFixed(2)} €
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through">
                    {regularPrice.toFixed(2)} €
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={productHref}
              onClick={handleViewDetail}
              className="w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-900 transition hover:border-emerald-500 hover:text-emerald-700"
            >
              {t('detail')}
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              disabled={isSalesSuspended}
              className={`w-full rounded-full px-4 py-3 text-center text-sm font-semibold transition ${isSalesSuspended
                ? 'cursor-not-allowed bg-gray-400 text-gray-600'
                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600'
              }`}
            >
              {isSalesSuspended ? t('salesSuspended') : t('addToCart')}
            </button>
            {appliedCoupon && (
              <span className="text-xs text-green-700 text-center -mt-2">{t('withCoupon')}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
