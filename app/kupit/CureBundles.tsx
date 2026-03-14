'use client';

import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { tracking } from '@/app/lib/tracking';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '@/app/lib/utils/sales-suspension';

const CAPSULES_ID = 47;
const GEL_ID = 669;
const ROLLER_ID = 680;

type BundleItem = { id: number; name: string; price: number; quantity: number; image?: string };

type Bundle = {
  key: '1m' | '2m' | '3m';
  title: string;
  subtitle: string;
  imageSrc: string;
  badge?: string;
  /** One-line “why this bundle” explanation */
  reason: string;
  usp: string[];
  /** Original list-price items (for UI “bežne”) */
  baseItems: BundleItem[];
  /** Items we add to cart (always list prices; discount is applied separately) */
  items: BundleItem[];
  /** Desired final bundle price (exact .99) */
  targetTotal: number;
  optional?: BundleItem[];
};

const LIST_PRICE_CAPSULES = 14.99;
const LIST_PRICE_GEL = 11.99;
const LIST_PRICE_ROLLER = 14.99;

/**
 * Cure bundles:
 * - Add items to cart at list prices (so products stay “real” items).
 * - Apply an exact manual discount so final totals land on .99.
 */
const bundles: Bundle[] = [
  {
    key: '1m',
    title: 'Kúra na 1 mesiac',
    subtitle: '1× kapsule + 1× gél',
    imageSrc: '/cures/cure-1m.png',
    reason: 'Najlepší štart, ak chcete otestovať účinok a nastaviť rutinu.',
    usp: ['Štart pre kĺby zvnútra aj zvonka', 'Ideálne na vyskúšanie', 'Rýchla lokálna úľava + dlhodobá podpora'],
    baseItems: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: LIST_PRICE_CAPSULES, quantity: 1, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: LIST_PRICE_GEL, quantity: 1, image: '/jointboost-gel.jpg' },
    ],
    items: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: LIST_PRICE_CAPSULES, quantity: 1, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: LIST_PRICE_GEL, quantity: 1, image: '/jointboost-gel.jpg' },
    ],
    targetTotal: 19.99,
  },
  {
    key: '2m',
    title: 'Kúra na 2 mesiace',
    subtitle: '2× kapsule + 2× gél',
    imageSrc: '/cures/cure-2m.png',
    badge: 'Najobľúbenejšie',
    reason: 'Odporúčané pri dlhodobejších ťažkostiach – výsledky často prichádzajú po 2–4 týždňoch.',
    usp: ['Najlepší pomer cena / výkon', '2 mesiace pravidelnej podpory', 'Najčastejšia voľba zákazníkov'],
    baseItems: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: LIST_PRICE_CAPSULES, quantity: 2, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: LIST_PRICE_GEL, quantity: 2, image: '/jointboost-gel.jpg' },
    ],
    items: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: LIST_PRICE_CAPSULES, quantity: 2, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: LIST_PRICE_GEL, quantity: 2, image: '/jointboost-gel.jpg' },
    ],
    targetTotal: 34.99,
  },
  {
    key: '3m',
    title: 'Kúra na 3 mesiace',
    subtitle: '3× kapsule + 3× gél',
    imageSrc: '/cures/cure-3m.png',
    badge: 'Najlepšia cena',
    reason: 'Najlepšia voľba pre pravidelnosť – 90 dní bez výpadkov je typicky najlepšia stratégia.',
    usp: ['Najvýhodnejšia voľba na 90 dní', 'Najnižšia cena za 1 mesiac', 'Zásoba bez stresu (a menej objednávok)'],
    baseItems: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: LIST_PRICE_CAPSULES, quantity: 3, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: LIST_PRICE_GEL, quantity: 3, image: '/jointboost-gel.jpg' },
    ],
    items: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: LIST_PRICE_CAPSULES, quantity: 3, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: LIST_PRICE_GEL, quantity: 3, image: '/jointboost-gel.jpg' },
    ],
    targetTotal: 49.99,
    optional: [
      { id: ROLLER_ID, name: 'Maderoterapický valček', price: LIST_PRICE_ROLLER, quantity: 1, image: '/product-image.png' },
    ],
  },
];

const format = (n: number) => new Intl.NumberFormat('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function CureBundles() {
  const { addToCart, openCart, setManualDiscount, clearManualDiscount } = useCart();

  const addBundle = (bundle: Bundle) => {
    if (isSalesSuspendedClient()) {
      alert(getSalesSuspensionMessageClient());
      return;
    }

    // Add products at list prices
    for (const item of bundle.items) {
      addToCart(item);
    }

    // Apply an exact discount so final price lands on .99
    const baseTotal = bundle.baseItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const desired = bundle.targetTotal;
    const discount = Math.max(0, Number((baseTotal - desired).toFixed(2)));

    // Reset any previous manual discount and apply a new one
    clearManualDiscount();
    if (discount > 0) {
      const months = bundle.key === '1m' ? '1 mesiac' : bundle.key === '2m' ? '2 mesiace' : '3 mesiace';
      setManualDiscount(discount, `Zľava za kúru (${months})`, `cure_${bundle.key}`);
    }

    tracking.addToCart({
      id: `bundle-${bundle.key}`,
      name: bundle.title,
      price: desired,
      quantity: 1,
    } as any);

    openCart();
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 sm:p-10 pb-10 sm:pb-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Vyber si kúru</h2>
          <p className="mt-1 text-slate-600">Odporúčané kombinácie na 1–3 mesiace.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {bundles.map((b) => {
          const baseTotal = b.baseItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const promoTotal = b.targetTotal;
          const saved = Math.max(0, Number((baseTotal - promoTotal).toFixed(2)));
          const savedPct = baseTotal > 0 ? Math.round((saved / baseTotal) * 100) : 0;
          return (
            <div
              key={b.key}
              className={`relative overflow-visible rounded-2xl border bg-white p-5 shadow-sm ${b.badge ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'}`}
            >
              {b.badge ? (
                <div className="absolute -right-3 -top-3 z-20 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  {b.badge}
                </div>
              ) : null}

              <div className="relative z-0 -mx-5 -mt-5">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-slate-100">
                  <Image
                    src={b.imageSrc}
                    alt={b.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-lg font-semibold text-slate-900">{b.title}</div>
                <div className="text-sm text-slate-600">{b.subtitle}</div>
                <div className="mt-1 text-xs text-slate-500">{b.reason}</div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-600">Cena kúry</span>
                  <span className="text-xl font-bold text-slate-900">{format(promoTotal)} €</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Bežne <span className="line-through">{format(baseTotal)} €</span>
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Ušetríš {format(saved)} € ({savedPct}%)
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-sm text-slate-700">
                {b.usp.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-[0.4rem] h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => addBundle(b)}
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Pridať kúru do košíka
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
