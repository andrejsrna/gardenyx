'use client';

import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { tracking } from '@/app/lib/tracking';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '@/app/lib/utils/sales-suspension';

const CAPSULES_ID = 47;
const GEL_ID = 669;
const ROLLER_ID = 680;

type Bundle = {
  key: '1m' | '2m' | '3m';
  title: string;
  subtitle: string;
  imageSrc: string;
  badge?: string;
  items: Array<{ id: number; name: string; price: number; quantity: number; image?: string }>;
  optional?: Array<{ id: number; name: string; price: number; quantity: number; image?: string }>;
};

const bundles: Bundle[] = [
  {
    key: '1m',
    title: 'Kúra na 1 mesiac',
    subtitle: '1× kapsule + 1× gél',
    imageSrc: '/cures/cure-1m.png',
    items: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: 14.99, quantity: 1, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: 11.99, quantity: 1, image: '/jointboost-gel.jpg' },
    ],
  },
  {
    key: '2m',
    title: 'Kúra na 2 mesiace',
    subtitle: '2× kapsule + 2× gél',
    imageSrc: '/cures/cure-2m.png',
    badge: 'Najobľúbenejšie',
    items: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: 14.99, quantity: 2, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: 11.99, quantity: 2, image: '/jointboost-gel.jpg' },
    ],
  },
  {
    key: '3m',
    title: 'Kúra na 3 mesiace',
    subtitle: '3× kapsule + 3× gél',
    imageSrc: '/cures/cure-3m.png',
    badge: 'Najlepšia cena',
    items: [
      { id: CAPSULES_ID, name: 'Najsilnejšia kĺbová výživa', price: 14.99, quantity: 3, image: '/kapsule-hero.jpeg' },
      { id: GEL_ID, name: 'Joint Boost Gél 100 ml', price: 11.99, quantity: 3, image: '/jointboost-gel.jpg' },
    ],
    optional: [
      { id: ROLLER_ID, name: 'Maderoterapický valček', price: 14.99, quantity: 1, image: '/product-image.png' },
    ],
  },
];

const format = (n: number) => new Intl.NumberFormat('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function CureBundles() {
  const { addToCart, openCart } = useCart();

  const addBundle = (bundle: Bundle) => {
    if (isSalesSuspendedClient()) {
      alert(getSalesSuspensionMessageClient());
      return;
    }

    for (const item of bundle.items) {
      addToCart(item);
    }

    tracking.addToCart({
      id: `bundle-${bundle.key}`,
      name: bundle.title,
      price: bundle.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      quantity: 1,
    } as any);

    openCart();
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 sm:p-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Vyber si kúru</h2>
          <p className="mt-1 text-slate-600">Odporúčané kombinácie na 1–3 mesiace (pridáme ako samostatné produkty do košíka).</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {bundles.map((b) => {
          const total = b.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return (
            <div key={b.key} className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${b.badge ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'}`}>
              {b.badge ? (
                <div className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  {b.badge}
                </div>
              ) : null}

              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={b.imageSrc} alt={b.title} fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{b.title}</div>
                  <div className="text-sm text-slate-600">{b.subtitle}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-600">Súčet produktov</span>
                  <span className="text-xl font-bold text-slate-900">{format(total)} €</span>
                </div>
                {b.optional?.length ? (
                  <p className="mt-2 text-xs text-slate-500">Voliteľne: valček pridaj ako extra (zatiaľ nie je v tejto karte zahrnutý).</p>
                ) : null}
              </div>

              <button
                onClick={() => addBundle(b)}
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Pridať kúru do košíka
              </button>

              <div className="mt-3 text-xs text-slate-500">
                Tip: po pridání môžeš v košíku upraviť množstvá.
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-slate-500">
        Pozn.: Ceny a názvy produktov tu sú zatiaľ natvrdo podľa aktuálneho cenníka v contente. Keď doplníš vlastné obrázky, len ich prepojíme.
      </div>
    </section>
  );
}
