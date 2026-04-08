import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CreditCard, MapPin, Package, Truck } from 'lucide-react';

type PageProps = { params: Promise<{ locale: string }> };

/* ------------------------------------------------------------------ */
/*  Localised content                                                   */
/* ------------------------------------------------------------------ */

type LocaleContent = {
  meta: { title: string; description: string };
  pageLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  shipping: {
    sectionTitle: string;
    freeThreshold: string;
    methods: Array<{ title: string; price: string; description: string; icon: 'pickup' | 'home' }>;
  };
  packeta: {
    sectionTitle: string;
    anchor: string;
    intro: string;
    steps: Array<{ title: string; body: string }>;
    note: string;
  };
  payment: {
    sectionTitle: string;
    methods: Array<{ title: string; description: string; icon: 'card' | 'apple' | 'google' }>;
  };
};

const content: Record<string, LocaleContent> = {
  sk: {
    meta: {
      title: 'Doprava a platba | GardenYX',
      description:
        'Informácie o spôsoboch doručenia cez Packeta a platobných metódach v e-shope GardenYX.',
    },
    pageLabel: 'Informácie',
    pageTitle: 'Doprava a platba',
    pageSubtitle: 'Všetko, čo potrebujete vedieť o doručení a platbe za vašu objednávku.',
    shipping: {
      sectionTitle: 'Spôsoby doručenia',
      freeThreshold: 'Pri objednávke nad 29 € máte dopravu zdarma.',
      methods: [
        {
          title: 'Packeta – Výdajné miesto',
          price: '2,90 €',
          description:
            'Vyzdvihnite balík na niektorom z tisícov výdajných miest Packeta na Slovensku, v Česku alebo Maďarsku. Miesto si vyberiete priamo pri objednávke.',
          icon: 'pickup',
        },
        {
          title: 'Packeta – Doručenie domov',
          price: '3,80 €',
          description:
            'Kuriér doručí balík priamo na vašu adresu. Dostanete SMS a e-mail s odhadovaným časom doručenia.',
          icon: 'home',
        },
      ],
    },
    packeta: {
      sectionTitle: 'Ako funguje Packeta?',
      anchor: 'ako-funguje-packeta',
      intro:
        'Packeta je moderná doručovacia sieť s tisíckami výdajných miest a expresným doručením domov. Takto prebieha doručenie vašej objednávky:',
      steps: [
        {
          title: 'Výber miesta alebo adresy',
          body: 'Pri pokladni si vyberiete výdajné miesto Packeta alebo zadáte domácu adresu. Výdajné miesta nájdete v lekárňach, potravinách, čerpacích staniciach a ďalších prevádzkach.',
        },
        {
          title: 'Odosielame váš balík',
          body: 'Po potvrdení objednávky a prijatí platby odovzdáme balík Packete. Štandardná doba expedície je 1 – 2 pracovné dni.',
        },
        {
          title: 'Notifikácia o doručení',
          body: 'Packeta vám pošle SMS a e-mail s informáciou, že balík je na ceste. Pri doručení domov dostanete aj odhadované časové okno.',
        },
        {
          title: 'Prevzatie balíka',
          body: 'Na výdajnom mieste si balík vyzdvihnete kedykoľvek počas otváracích hodín. Na doručenie domov kuriér dorazí v dohodnutom čase.',
        },
      ],
      note: 'Sledovanie zásielky je dostupné priamo vo vašom účte alebo cez odkaz v e-maile od Packety.',
    },
    payment: {
      sectionTitle: 'Platobné metódy',
      methods: [
        {
          title: 'Kreditná / debetná karta',
          description: 'Visa, Mastercard a ďalšie karty. Platba prebieha bezpečne cez Stripe.',
          icon: 'card',
        },
        {
          title: 'Apple Pay',
          description: 'Rýchla platba cez Apple Pay na iPhone alebo Mac.',
          icon: 'apple',
        },
        {
          title: 'Google Pay',
          description: 'Rýchla platba cez Google Pay na Android a Chrome.',
          icon: 'google',
        },
      ],
    },
  },

  en: {
    meta: {
      title: 'Shipping & Payment | GardenYX',
      description:
        'Information about delivery methods via Packeta and payment options in the GardenYX shop.',
    },
    pageLabel: 'Information',
    pageTitle: 'Shipping & Payment',
    pageSubtitle: 'Everything you need to know about delivery and payment for your order.',
    shipping: {
      sectionTitle: 'Delivery methods',
      freeThreshold: 'Free shipping on orders over €29.',
      methods: [
        {
          title: 'Packeta – Pick-up point',
          price: '€2.90',
          description:
            'Collect your parcel from one of thousands of Packeta pick-up points in Slovakia, Czech Republic or Hungary. You choose the location at checkout.',
          icon: 'pickup',
        },
        {
          title: 'Packeta – Home delivery',
          price: '€3.80',
          description:
            'A courier will deliver the parcel directly to your address. You will receive an SMS and email with an estimated delivery time.',
          icon: 'home',
        },
      ],
    },
    packeta: {
      sectionTitle: 'How does Packeta work?',
      anchor: 'ako-funguje-packeta',
      intro:
        'Packeta is a modern delivery network with thousands of pick-up points and express home delivery. Here is how your order is delivered:',
      steps: [
        {
          title: 'Choose a location or address',
          body: 'At checkout you select a Packeta pick-up point or enter your home address. Pick-up points are located in pharmacies, grocery stores, petrol stations and other shops.',
        },
        {
          title: 'We ship your parcel',
          body: 'After your order is confirmed and payment received, we hand the parcel over to Packeta. Standard dispatch time is 1 – 2 business days.',
        },
        {
          title: 'Delivery notification',
          body: 'Packeta will send you an SMS and email letting you know your parcel is on the way. For home delivery you will also receive an estimated time window.',
        },
        {
          title: 'Collect or receive your parcel',
          body: 'At a pick-up point you can collect your parcel any time during opening hours. For home delivery the courier will arrive at the agreed time.',
        },
      ],
      note: 'Parcel tracking is available in your account or via the link in the email from Packeta.',
    },
    payment: {
      sectionTitle: 'Payment methods',
      methods: [
        {
          title: 'Credit / debit card',
          description: 'Visa, Mastercard and other cards. Payments are processed securely via Stripe.',
          icon: 'card',
        },
        {
          title: 'Apple Pay',
          description: 'Quick payment via Apple Pay on iPhone or Mac.',
          icon: 'apple',
        },
        {
          title: 'Google Pay',
          description: 'Quick payment via Google Pay on Android and Chrome.',
          icon: 'google',
        },
      ],
    },
  },

  hu: {
    meta: {
      title: 'Szállítás és fizetés | GardenYX',
      description:
        'Információk a Packeta kézbesítési módszereiről és a GardenYX áruházban elérhető fizetési lehetőségekről.',
    },
    pageLabel: 'Információk',
    pageTitle: 'Szállítás és fizetés',
    pageSubtitle: 'Minden, amit a rendelése kézbesítéséről és fizetéséről tudnia kell.',
    shipping: {
      sectionTitle: 'Kézbesítési módok',
      freeThreshold: '29 € feletti rendelésnél ingyenes a szállítás.',
      methods: [
        {
          title: 'Packeta – Átvevőpont',
          price: '2,90 €',
          description:
            'Vegye át csomagját Szlovákia, Csehország vagy Magyarország egyik Packeta átvevőpontján. A helyszínt a fizetésnél választja ki.',
          icon: 'pickup',
        },
        {
          title: 'Packeta – Házhozszállítás',
          price: '3,80 €',
          description:
            'A futár közvetlenül az Ön által megadott címre szállítja a csomagot. SMS-t és e-mailt kap a várható kézbesítési időről.',
          icon: 'home',
        },
      ],
    },
    packeta: {
      sectionTitle: 'Hogyan működik a Packeta?',
      anchor: 'ako-funguje-packeta',
      intro:
        'A Packeta modern kézbesítési hálózat, több ezer átvevőponttal és expressz házhozszállítással. Így zajlik a rendelése kézbesítése:',
      steps: [
        {
          title: 'Helyszín vagy cím kiválasztása',
          body: 'A fizetésnél kiválaszt egy Packeta átvevőpontot, vagy megadja otthoni címét. Az átvevőpontok gyógyszertárakban, élelmiszerboltokban, benzinkutakon és egyéb üzletekben találhatók.',
        },
        {
          title: 'Csomagjának elküldése',
          body: 'A rendelés visszaigazolása és a fizetés beérkezése után átadjuk a csomagot a Packetának. A szokásos kiszállítási idő 1–2 munkanap.',
        },
        {
          title: 'Kézbesítési értesítés',
          body: 'A Packeta SMS-t és e-mailt küld Önnek, tájékoztatva arról, hogy a csomag úton van. Házhozszállítás esetén megkapja a várható időablakot is.',
        },
        {
          title: 'Csomag átvétele',
          body: 'Az átvevőponton bármikor átveheti csomagját a nyitvatartási idő alatt. Házhozszállítás esetén a futár a megbeszélt időpontban érkezik.',
        },
      ],
      note: 'A csomagkövetés elérhető fiókjában vagy a Packeta e-mailjében lévő linken keresztül.',
    },
    payment: {
      sectionTitle: 'Fizetési módok',
      methods: [
        {
          title: 'Hitelkártya / bankkártya',
          description: 'Visa, Mastercard és egyéb kártyák. A fizetés biztonságosan, Stripe-on keresztül történik.',
          icon: 'card',
        },
        {
          title: 'Apple Pay',
          description: 'Gyors fizetés Apple Pay-jel iPhone-on vagy Mac-en.',
          icon: 'apple',
        },
        {
          title: 'Google Pay',
          description: 'Gyors fizetés Google Pay-jel Androidon és Chrome-ban.',
          icon: 'google',
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale] ?? content.sk;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const localePrefix = locale === 'sk' ? '' : `/${locale}`;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: siteUrl
      ? {
          canonical: `${siteUrl}${localePrefix}/doprava-a-platba`,
          languages: {
            sk: `${siteUrl}/doprava-a-platba`,
            en: `${siteUrl}/en/doprava-a-platba`,
            hu: `${siteUrl}/hu/doprava-a-platba`,
          },
        }
      : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Payment method icons                                                */
/* ------------------------------------------------------------------ */

function CardIcon() {
  return <CreditCard className="w-6 h-6 text-green-600" />;
}

function AppleIcon() {
  return (
    <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.17.8 1.2-.24 2.35-.93 3.62-.84 1.54.12 2.69.74 3.44 1.9-3.14 1.88-2.4 5.98.45 7.13-.61 1.56-1.41 3.1-2.68 3.89zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default async function ShippingPaymentPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content[locale] ?? content.sk;

  return (
    <main className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-6 sm:px-8 space-y-12">

        {/* Page header */}
        <header>
          <p className="text-sm font-medium uppercase tracking-widest text-green-700 mb-2">
            {c.pageLabel}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{c.pageTitle}</h1>
          <p className="text-gray-600 text-lg">{c.pageSubtitle}</p>
        </header>

        {/* ── Shipping methods ── */}
        <section aria-labelledby="shipping-title">
          <h2 id="shipping-title" className="text-xl font-semibold text-gray-900 mb-4">
            {c.shipping.sectionTitle}
          </h2>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-800">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {c.shipping.freeThreshold}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {c.shipping.methods.map((method) => (
              <div
                key={method.title}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex gap-4"
              >
                <div className="mt-1 shrink-0 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  {method.icon === 'pickup' ? (
                    <MapPin className="w-5 h-5 text-green-600" aria-hidden="true" />
                  ) : (
                    <Truck className="w-5 h-5 text-green-600" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{method.title}</p>
                  <p className="text-green-700 font-medium text-sm mt-0.5">{method.price}</p>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How Packeta works ── */}
        <section id={c.packeta.anchor} aria-labelledby="packeta-title">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-green-600 shrink-0" aria-hidden="true" />
            <h2 id="packeta-title" className="text-xl font-semibold text-gray-900">
              {c.packeta.sectionTitle}
            </h2>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">{c.packeta.intro}</p>
          <ol className="space-y-4">
            {c.packeta.steps.map((step, i) => (
              <li key={i} className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <span className="shrink-0 w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-gray-500 italic">{c.packeta.note}</p>
        </section>

        {/* ── Payment methods ── */}
        <section aria-labelledby="payment-title">
          <h2 id="payment-title" className="text-xl font-semibold text-gray-900 mb-4">
            {c.payment.sectionTitle}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {c.payment.methods.map((method) => (
              <div
                key={method.title}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  {method.icon === 'card' && <CardIcon />}
                  {method.icon === 'apple' && <AppleIcon />}
                  {method.icon === 'google' && <GoogleIcon />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{method.title}</p>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
