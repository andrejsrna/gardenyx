import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-max-trava';

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-travnik',
  en: '/en/lawn-fertilizer',
  hu: '/hu/gyeptragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na trávnik Hakofyt Max tráva | GardenYX',
    metaDescription:
      'Hľadáte hnojivo na trávnik na jar aj počas sezóny? Hakofyt Max tráva podporuje sýtozelený vzhľad, hustejší porast a vitalitu trávnika.',
    eyebrow: 'Hnojivo na trávnik',
    title: 'Hnojivo na trávnik pre hustý a sýtozelený porast',
    intro:
      'Hakofyt Max tráva je listové hnojivo určené pre trávnik a rastliny s vyššou potrebou dusíka. Pomáha doplniť výživu v období aktívneho rastu, po zime aj počas sezóny.',
    primaryCta: 'Pozrieť Hakofyt Max tráva',
    secondaryCta: 'Ako hnojiť trávnik',
    productEyebrow: 'Odporúčaný produkt',
    productTitle: 'Hakofyt Max tráva',
    productText:
      'Jediný odporúčaný produkt na tejto stránke. Vhodný pre starostlivosť o trávnik, kde chcete podporiť zelenú farbu, hustejší rast a celkovú kondíciu porastu.',
    detailLabel: 'Detail produktu',
    buyLabel: 'Kúpiť produkt',
    reasonsTitle: 'Kedy siahnuť po hnojive na trávnik',
    reasons: [
      ['Po zime', 'keď trávnik začína rásť a potrebuje doplniť výživu po chladnom období.'],
      ['Pri redšom poraste', 'ak chcete podporiť rovnomernejšie zahustenie a vitálnejší vzhľad.'],
      ['Po záťaži', 'keď trávnik oslabí sucho, časté kosenie alebo intenzívne používanie záhrady.'],
    ],
    methodTitle: 'Ako používať hnojivo na trávnik rozumne',
    methodText:
      'Hnojivo aplikujte na aktívne rastúci trávnik podľa dávkovania konkrétneho produktu. Najlepší výsledok dosiahnete po prvom ľahkom kosení, na očistenom poraste a mimo horúčav alebo prudkého slnka.',
    faqTitle: 'Časté otázky k hnojivu na trávnik',
    faqs: [
      {
        question: 'Kedy je vhodné použiť hnojivo na trávnik?',
        answer:
          'Najvhodnejšie je obdobie, keď trávnik aktívne rastie. Na jar počkajte, kým pôda preschne a trávnik absolvuje prvé ľahké kosenie.',
      },
      {
        question: 'Je Hakofyt Max tráva vhodný ako jarné hnojivo na trávnik?',
        answer:
          'Áno, používa sa pri trávniku a rastlinách s vyššou potrebou dusíka, najmä keď chcete podporiť zelený rast a vitalitu porastu.',
      },
      {
        question: 'Stačí použiť iba hnojivo?',
        answer:
          'Hnojivo funguje najlepšie spolu so správnym kosením, primeranou závlahou a odstránením plsti alebo zvyškov po zime.',
      },
    ],
  },
  en: {
    metaTitle: 'Lawn fertilizer Hakofyt Max Grass | GardenYX',
    metaDescription:
      'Looking for a lawn fertilizer for spring and the growing season? Hakofyt Max Grass supports a deep green look, denser growth and lawn vitality.',
    eyebrow: 'Lawn fertilizer',
    title: 'Lawn fertilizer for dense, deep green grass',
    intro:
      'Hakofyt Max Grass is a foliar fertilizer for lawns and plants with higher nitrogen needs. It helps replenish nutrition during active growth, after winter and throughout the season.',
    primaryCta: 'View Hakofyt Max Grass',
    secondaryCta: 'How to fertilize a lawn',
    productEyebrow: 'Recommended product',
    productTitle: 'Hakofyt Max Grass',
    productText:
      'The only recommended product on this page. Suitable for lawn care when you want to support green color, denser growth and overall turf condition.',
    detailLabel: 'Product detail',
    buyLabel: 'Buy product',
    reasonsTitle: 'When to use lawn fertilizer',
    reasons: [
      ['After winter', 'when the lawn starts growing and needs nutrition after the cold period.'],
      ['For thinner turf', 'when you want to support more even density and a healthier appearance.'],
      ['After stress', 'when the lawn is weakened by drought, frequent mowing or intensive garden use.'],
    ],
    methodTitle: 'How to use lawn fertilizer sensibly',
    methodText:
      'Apply fertilizer to actively growing grass according to the specific product instructions. The best result comes after the first light mowing, on a cleaned lawn and outside heat or strong direct sun.',
    faqTitle: 'Lawn fertilizer FAQ',
    faqs: [
      {
        question: 'When should I use lawn fertilizer?',
        answer:
          'Use it when the lawn is actively growing. In spring, wait until the soil dries and the lawn has had its first light mowing.',
      },
      {
        question: 'Is Hakofyt Max Grass suitable as a spring lawn fertilizer?',
        answer:
          'Yes. It is used for lawns and plants with higher nitrogen needs, especially when you want to support green growth and vitality.',
      },
      {
        question: 'Is fertilizer alone enough?',
        answer:
          'Fertilizer works best together with correct mowing, adequate watering and removal of thatch or winter debris.',
      },
    ],
  },
  hu: {
    metaTitle: 'Gyeptrágya Hakofyt Max gyep | GardenYX',
    metaDescription:
      'Gyeptrágyát keres tavaszra és a szezonra? A Hakofyt Max gyep támogatja a mélyzöld megjelenést, a sűrűbb növekedést és a gyep vitalitását.',
    eyebrow: 'Gyeptrágya',
    title: 'Gyeptrágya sűrű, mélyzöld gyephez',
    intro:
      'A Hakofyt Max gyep lombtrágya gyephez és magasabb nitrogénigényű növényekhez. Segít pótolni a tápanyagokat aktív növekedéskor, tél után és a szezon során.',
    primaryCta: 'Hakofyt Max gyep megtekintése',
    secondaryCta: 'Gyeptrágyázási útmutató',
    productEyebrow: 'Ajánlott termék',
    productTitle: 'Hakofyt Max gyep',
    productText:
      'Az egyetlen ajánlott termék ezen az oldalon. Gyepápoláshoz, ha cél a zöldebb szín, a sűrűbb növekedés és a jobb általános kondíció.',
    detailLabel: 'Termék részletei',
    buyLabel: 'Termék vásárlása',
    reasonsTitle: 'Mikor érdemes gyeptrágyát használni',
    reasons: [
      ['Tél után', 'amikor a gyep növekedni kezd, és tápanyagpótlásra van szüksége.'],
      ['Ritkább gyepnél', 'ha egyenletesebb sűrűséget és egészségesebb megjelenést szeretne.'],
      ['Stressz után', 'amikor a gyepet aszály, gyakori nyírás vagy intenzív használat gyengítette.'],
    ],
    methodTitle: 'Hogyan használjuk ésszerűen a gyeptrágyát',
    methodText:
      'A trágyát aktívan növekvő gyepen alkalmazza az adott termék útmutatója szerint. A legjobb eredmény az első enyhe nyírás után, megtisztított gyepen, hőség és erős napsütés nélkül érhető el.',
    faqTitle: 'Gyakori kérdések a gyeptrágyáról',
    faqs: [
      {
        question: 'Mikor érdemes gyeptrágyát használni?',
        answer:
          'Akkor, amikor a gyep aktívan növekszik. Tavasszal várja meg, amíg a talaj felszárad és megtörténik az első enyhe fűnyírás.',
      },
      {
        question: 'A Hakofyt Max gyep alkalmas tavaszi gyeptrágyának?',
        answer:
          'Igen. Gyephez és magasabb nitrogénigényű növényekhez használható, különösen a zöld növekedés és vitalitás támogatására.',
      },
      {
        question: 'Elég önmagában a trágya?',
        answer:
          'A trágya megfelelő fűnyírással, elegendő öntözéssel és a filcréteg vagy téli maradványok eltávolításával működik a legjobban.',
      },
    ],
  },
} as const;

function getCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.sk;
}

function stripHtml(value?: string) {
  return value?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getCopy(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gardenyx.eu';
  const canonical = `${siteUrl}${localeToPath[locale] || localeToPath.sk}`;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        Object.entries(localeToPath).map(([alternateLocale, path]) => [alternateLocale, `${siteUrl}${path}`]),
      ),
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: canonical,
      siteName: 'GardenYX',
      locale: localeToOgLocale[locale] || 'sk_SK',
      type: 'website',
    },
  };
}

export default async function LawnFertilizerLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getCopy(locale);
  const product = await getProductBySlug(PRODUCT_SLUG, locale);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gardenyx.eu';
  const canonical = `${siteUrl}${localeToPath[locale] || localeToPath.sk}`;
  const productUrl = `${siteUrl}/${locale}/produkt/${product.slug}`;
  const productImage = product.images[0];
  const productDescription = stripHtml(product.short_description) || t.productText;
  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: t.metaTitle,
        description: t.metaDescription,
        inLanguage: locale,
        about: {
          '@type': 'Thing',
          name: t.eyebrow,
        },
        mainEntity: {
          '@id': `${productUrl}#product`,
        },
      },
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: productDescription,
        image: productImage?.src,
        sku: product.sku || undefined,
        brand: {
          '@type': 'Brand',
          name: 'Hakofyt',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: product.currency || 'EUR',
          price: product.price,
          availability: product.stock_status === 'outofstock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: t.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="bg-[#f8f8f3] text-stone-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden border-b border-emerald-100">
        {productImage ? (
          <Image
            src={productImage.src}
            alt={productImage.alt || product.name}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-contain object-[85%_58%] opacity-20 md:opacity-35 lg:object-[80%_52%]"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#f8f8f3_0%,rgba(248,248,243,0.94)_42%,rgba(248,248,243,0.62)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 -z-10 h-40 bg-gradient-to-t from-[#f8f8f3] to-transparent" />

        <div className="container mx-auto flex min-h-[calc(100vh-5rem)] items-center px-6 py-16">
          <div className="max-w-3xl">
            <p className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">
              {t.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.03] tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl sm:leading-9">
              {t.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                {t.primaryCta}
              </Link>
              <Link
                href={{ pathname: '/blog/[slug]', params: { slug: 'ako-a-kedy-hnojit-travnik-na-jar' } }}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/80 px-7 py-4 text-sm font-bold text-stone-900 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                {t.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{t.productEyebrow}</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">{t.productTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-stone-700">{t.productText}</p>
          </div>

          <article className="grid overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-stone-200/70 md:grid-cols-[0.9fr_1.1fr]">
            <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="relative min-h-80 bg-stone-50">
              {productImage ? (
                <Image
                  src={productImage.src}
                  alt={productImage.alt || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : null}
            </Link>
            <div className="flex flex-col p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{product.categories[0]?.name || 'Hakofyt'}</p>
              <h3 className="mt-3 text-3xl font-bold text-stone-950">{product.name}</h3>
              <p className="mt-4 text-base leading-7 text-stone-600">{productDescription}</p>
              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-500">Cena</p>
                  <p className="mt-1 text-4xl font-bold text-stone-950">{Number(product.price).toFixed(2)} €</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                  {product.stock_status === 'outofstock' ? 'Na dopyt' : 'Skladom'}
                </span>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link
                  href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  {t.buyLabel}
                </Link>
                <Link
                  href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-900 transition hover:border-emerald-500 hover:text-emerald-700"
                >
                  {t.detailLabel}
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-white py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-950">{t.reasonsTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {t.reasons.map(([title, description]) => (
              <article key={title} className="border-l border-emerald-200 pl-6">
                <h3 className="text-2xl font-semibold text-stone-950">{title}</h3>
                <p className="mt-3 text-base leading-7 text-stone-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <h2 className="text-4xl font-bold tracking-tight text-stone-950">{t.methodTitle}</h2>
          <div className="text-lg leading-9 text-stone-700">
            <p>{t.methodText}</p>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {['1', '2', '3'].map((step, index) => (
                <div key={step} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
                  <dt className="text-3xl font-bold text-emerald-700">{step}</dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">{t.reasons[index][0]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold tracking-tight text-stone-950">{t.faqTitle}</h2>
            <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {t.faqs.map((item) => (
                <article key={item.question} className="py-6">
                  <h3 className="text-xl font-semibold text-stone-950">{item.question}</h3>
                  <p className="mt-3 text-base leading-7 text-stone-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
