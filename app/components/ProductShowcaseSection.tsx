import Image from 'next/image';
import { Link } from '../../i18n/navigation';
import type { LocalProduct } from '../lib/products';

type ProductShowcaseSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  detailLabel: string;
  products: LocalProduct[];
  cta?: {
    href: '/kupit';
    label: string;
  };
  className?: string;
};

export default function ProductShowcaseSection({
  eyebrow,
  title,
  description,
  detailLabel,
  products,
  cta,
  className = 'bg-stone-50 py-20',
}: ProductShowcaseSectionProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className={className}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{title}</h2>
            {description ? <p className="mt-4 text-lg leading-8 text-stone-600">{description}</p> : null}
          </div>

          {cta ? (
            <Link
              href={cta.href}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-emerald-500 hover:text-emerald-700"
            >
              {cta.label}
            </Link>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.wcId}
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].src}
                      alt={product.images[0].alt || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>

                <div className="p-5">
                  {product.categories[0] ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {product.categories[0].name}
                    </p>
                  ) : null}

                  <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-stone-900">{product.name}</h3>
                  {product.short_description ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{product.short_description}</p>
                  ) : null}

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-2xl font-bold text-stone-900">{Number(product.price).toFixed(2)} €</span>
                    <span className="text-sm font-semibold text-emerald-700">{detailLabel}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
