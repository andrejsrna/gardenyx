import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getAllProducts } from '@/app/lib/products';

const HAKOFYT_CATEGORY_ORDER = [
  'hnojiva-hakofyt-plus',
  'hnojiva-hakofyt-b',
  'hnojiva-hakofyt-max',
] as const;

const localeToPath: Record<string, string> = {
  sk: '/sk/organicke-hnojivo',
  en: '/en/organic-fertilizer',
  hu: '/hu/szerves-mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'Organické hnojivo pre záhradu | GardenYX',
    metaDescription:
      'Organické hnojivo Hakofyt kombinuje NPK živiny, mikroprvky, humínové látky, aminokyseliny a prírodné stimulátory rastu pre zdravšie rastliny.',
    eyebrow: 'Organické hnojivo',
    title: 'Organické hnojivo, ktoré rastlinám dodá viac než len základné NPK',
    intro:
      'Hakofyt spája presne dávkované minerálne živiny s organickými podpornými látkami. Výsledkom je listové hnojivo pre zeleninu, ovocné dreviny, kvety, trávnik aj špecializované plodiny, ktoré podporuje rast, vitalitu a kvalitu úrody.',
    primaryCta: 'Vybrať organické hnojivo',
    secondaryCta: 'Pozrieť všetky hnojivá',
    heroBadgeTitle: 'NPK + organické stimulátory',
    heroBadgeText: 'Humínové látky, aminokyseliny a sacharidy pomáhajú rastlinám lepšie využiť dodané živiny.',
    benefitsTitle: 'Prečo zvoliť organické hnojivo Hakofyt',
    benefitsIntro:
      'Pri výžive rastlín nerozhoduje iba množstvo dusíka, fosforu a draslíka. Dôležité je aj to, ako efektívne vie rastlina živiny prijať a využiť.',
    benefits: [
      ['Rýchla listová výživa', 'Živiny sa dostávajú priamo cez listy, čo je praktické pri strese, suchu alebo intenzívnom raste.'],
      ['Komplexné zloženie', 'Makroprvky dopĺňajú mikroprvky ako železo, zinok, horčík, mangán, meď, bór a molybdén.'],
      ['Organické podporné látky', 'Humínové látky, aminokyseliny a sacharidy podporujú vitalitu, metabolizmus a príjem živín.'],
    ],
    productsEyebrow: 'Odporúčané produkty',
    productsTitle: 'Organominerálne hnojivá Hakofyt podľa použitia',
    productsDescription:
      'Vyberte si organické hnojivo podľa rastliny. Iné zloženie potrebuje zelenina, iné ovocné stromy, kvety, čučoriedky alebo trávnik.',
    detailLabel: 'Detail',
    compareTitle: 'Organické vs. čisto minerálne hnojivo',
    compareText:
      'Čisto minerálne hnojivo vie rýchlo dodať NPK živiny, ale často nerieši biologickú aktivitu a schopnosť rastliny živiny efektívne využiť. Organominerálny prístup Hakofyt kombinuje presnosť NPK so zložkami, ktoré podporujú rastlinu aj mimo samotného čísla na etikete.',
    compareItems: [
      ['Minerálne hnojivo', 'Rýchly nástup účinku, presné NPK, ale bez organických stimulátorov.'],
      ['Organické hnojivo', 'Podpora pôdy a mikrobiológie, často pomalší a menej presný nástup.'],
      ['Hakofyt', 'Presné živiny doplnené o mikroprvky, humínové látky, aminokyseliny a stimulátory rastu.'],
    ],
    faqTitle: 'Časté otázky k organickému hnojivu',
    faqs: [
      {
        question: 'Je Hakofyt organické hnojivo?',
        answer:
          'Hakofyt je organominerálne listové hnojivo. Kombinuje základné NPK živiny a mikroprvky s organickými podpornými látkami, ako sú humínové látky, aminokyseliny a sacharidy.',
      },
      {
        question: 'Na čo je organické hnojivo vhodné?',
        answer:
          'Je vhodné na pravidelnú výživu rastlín počas sezóny. V sortimente Hakofyt nájdete varianty pre zeleninu, ovocné dreviny, kvety, trávnik, jahody, čučoriedky, citrusy aj okrasné dreviny.',
      },
      {
        question: 'Aký je rozdiel medzi organickým a minerálnym hnojivom?',
        answer:
          'Minerálne hnojivo dodáva presné živiny rýchlo. Organické zložky zasa podporujú vitalitu, pôdne prostredie a využitie živín. Hakofyt kombinuje výhody oboch prístupov.',
      },
      {
        question: 'Môžem organické hnojivo používať na trávnik?',
        answer:
          'Áno, pre trávnik je v rade Hakofyt určený najmä Hakofyt Max tráva s vyšším obsahom dusíka a prvkami podporujúcimi sýtozelený vzhľad porastu.',
      },
    ],
    finalTitle: 'Vyberte hnojivo podľa rastliny',
    finalText:
      'Začnite tým, čo pestujete. GardenYX ponúka Hakofyt riešenia pre trávnik, zeleninu, ovocné dreviny, kvety aj špecializované plodiny.',
    finalCta: 'Prejsť do obchodu',
  },
  en: {
    metaTitle: 'Organic fertilizer for the garden | GardenYX',
    metaDescription:
      'Hakofyt organic fertilizer combines NPK nutrients, micro-elements, humic substances, amino acids and natural growth stimulators for healthier plants.',
    eyebrow: 'Organic fertilizer',
    title: 'Organic fertilizer that gives plants more than basic NPK',
    intro:
      'Hakofyt combines precisely dosed mineral nutrients with organic support substances. The result is a foliar fertilizer for vegetables, fruit trees, flowers, lawns and specialty crops that supports growth, vitality and harvest quality.',
    primaryCta: 'Choose organic fertilizer',
    secondaryCta: 'View all fertilizers',
    heroBadgeTitle: 'NPK + organic stimulators',
    heroBadgeText: 'Humic substances, amino acids and carbohydrates help plants use supplied nutrients more effectively.',
    benefitsTitle: 'Why choose Hakofyt organic fertilizer',
    benefitsIntro:
      'Plant nutrition is not only about how much nitrogen, phosphorus and potassium you add. It also matters how efficiently the plant can absorb and use those nutrients.',
    benefits: [
      ['Fast foliar nutrition', 'Nutrients enter directly through the leaves, useful during stress, drought or intensive growth.'],
      ['Complex composition', 'Macro-elements are supported by micro-elements such as iron, zinc, magnesium, manganese, copper, boron and molybdenum.'],
      ['Organic support substances', 'Humic substances, amino acids and carbohydrates support vitality, metabolism and nutrient uptake.'],
    ],
    productsEyebrow: 'Recommended products',
    productsTitle: 'Hakofyt organomineral fertilizers by use',
    productsDescription:
      'Choose organic fertilizer by plant type. Vegetables, fruit trees, flowers, blueberries and lawns each need a different formula.',
    detailLabel: 'Detail',
    compareTitle: 'Organic vs. purely mineral fertilizer',
    compareText:
      'Pure mineral fertilizer can quickly supply NPK nutrients, but it often does not support biological activity or nutrient-use efficiency. The Hakofyt organomineral approach combines NPK precision with substances that support the plant beyond the label numbers.',
    compareItems: [
      ['Mineral fertilizer', 'Fast effect and precise NPK, but without organic stimulators.'],
      ['Organic fertilizer', 'Supports soil and microbiology, often with a slower and less precise effect.'],
      ['Hakofyt', 'Precise nutrients supported by micro-elements, humic substances, amino acids and growth stimulators.'],
    ],
    faqTitle: 'Organic fertilizer FAQ',
    faqs: [
      {
        question: 'Is Hakofyt an organic fertilizer?',
        answer:
          'Hakofyt is an organomineral foliar fertilizer. It combines NPK nutrients and micro-elements with organic support substances such as humic substances, amino acids and carbohydrates.',
      },
      {
        question: 'What is organic fertilizer suitable for?',
        answer:
          'It is suitable for regular plant nutrition during the season. The Hakofyt range includes variants for vegetables, fruit trees, flowers, lawns, strawberries, blueberries, citrus and ornamental trees.',
      },
      {
        question: 'What is the difference between organic and mineral fertilizer?',
        answer:
          'Mineral fertilizer supplies precise nutrients quickly. Organic components support vitality, soil environment and nutrient use. Hakofyt combines advantages of both approaches.',
      },
      {
        question: 'Can I use organic fertilizer on a lawn?',
        answer:
          'Yes. Hakofyt Max Lawn is designed for lawns with higher nitrogen content and elements that support a deep green appearance.',
      },
    ],
    finalTitle: 'Choose fertilizer by plant',
    finalText:
      'Start with what you grow. GardenYX offers Hakofyt solutions for lawns, vegetables, fruit trees, flowers and specialty crops.',
    finalCta: 'Go to shop',
  },
  hu: {
    metaTitle: 'Szerves műtrágya kerthez | GardenYX',
    metaDescription:
      'A Hakofyt szerves műtrágya NPK tápanyagokat, mikroelemeket, huminsavakat, aminosavakat és természetes növekedésserkentőket kombinál az egészségesebb növényekért.',
    eyebrow: 'Szerves műtrágya',
    title: 'Szerves műtrágya, amely többet ad a növényeknek az alap NPK-nál',
    intro:
      'A Hakofyt pontosan adagolt ásványi tápanyagokat kombinál szerves támogató anyagokkal. Az eredmény lombtrágya zöldségekhez, gyümölcsfákhoz, virágokhoz, gyephez és speciális növényekhez.',
    primaryCta: 'Szerves műtrágya választása',
    secondaryCta: 'Minden műtrágya',
    heroBadgeTitle: 'NPK + szerves serkentők',
    heroBadgeText: 'A huminsavak, aminosavak és szénhidrátok segítik a tápanyagok jobb hasznosítását.',
    benefitsTitle: 'Miért válassza a Hakofyt szerves műtrágyát',
    benefitsIntro:
      'A növénytáplálásban nem csak a nitrogén, foszfor és kálium mennyisége számít. Az is fontos, milyen hatékonyan tudja a növény felvenni és felhasználni a tápanyagokat.',
    benefits: [
      ['Gyors lombon keresztüli tápanyagellátás', 'A tápanyagok közvetlenül a leveleken keresztül jutnak be, ami stressz, szárazság vagy intenzív növekedés idején praktikus.'],
      ['Komplex összetétel', 'A makroelemeket vas, cink, magnézium, mangán, réz, bór és molibdén egészíti ki.'],
      ['Szerves támogató anyagok', 'A huminsavak, aminosavak és szénhidrátok támogatják a vitalitást, anyagcserét és tápanyagfelvételt.'],
    ],
    productsEyebrow: 'Ajánlott termékek',
    productsTitle: 'Hakofyt organominerális műtrágyák felhasználás szerint',
    productsDescription:
      'Válasszon szerves műtrágyát növénytípus szerint. A zöldségeknek, gyümölcsfáknak, virágoknak, áfonyának és gyepnek eltérő összetételre van szükségük.',
    detailLabel: 'Részletek',
    compareTitle: 'Szerves vagy tisztán ásványi műtrágya',
    compareText:
      'A tisztán ásványi műtrágya gyorsan adhat NPK tápanyagokat, de gyakran nem támogatja a biológiai aktivitást és a tápanyag-hasznosítást. A Hakofyt organominerális megközelítése az NPK pontosságát támogató szerves összetevőkkel kombinálja.',
    compareItems: [
      ['Ásványi műtrágya', 'Gyors hatás és pontos NPK, de szerves serkentők nélkül.'],
      ['Szerves műtrágya', 'Támogatja a talajt és a mikrobiológiát, gyakran lassabb hatással.'],
      ['Hakofyt', 'Pontos tápanyagok mikroelemekkel, huminsavakkal, aminosavakkal és növekedésserkentőkkel.'],
    ],
    faqTitle: 'Gyakori kérdések a szerves műtrágyáról',
    faqs: [
      {
        question: 'A Hakofyt szerves műtrágya?',
        answer:
          'A Hakofyt organominerális lombtrágya. NPK tápanyagokat és mikroelemeket kombinál szerves támogató anyagokkal, például huminsavakkal, aminosavakkal és szénhidrátokkal.',
      },
      {
        question: 'Mire alkalmas a szerves műtrágya?',
        answer:
          'Rendszeres szezonális növénytáplálásra alkalmas. A Hakofyt kínálatban van változat zöldségekhez, gyümölcsfákhoz, virágokhoz, gyephez, eperhez, áfonyához, citrusokhoz és díszfákhoz.',
      },
      {
        question: 'Mi a különbség a szerves és ásványi műtrágya között?',
        answer:
          'Az ásványi műtrágya gyorsan ad pontos tápanyagokat. A szerves összetevők a vitalitást, talajkörnyezetet és tápanyag-hasznosítást támogatják. A Hakofyt mindkét megközelítés előnyeit kombinálja.',
      },
      {
        question: 'Használható szerves műtrágya gyepen?',
        answer:
          'Igen. Gyephez a Hakofyt Max Gyep készült, magasabb nitrogéntartalommal és a mélyzöld megjelenést támogató elemekkel.',
      },
    ],
    finalTitle: 'Válasszon műtrágyát növény szerint',
    finalText:
      'Induljon ki abból, mit termeszt. A GardenYX Hakofyt megoldásokat kínál gyephez, zöldséghez, gyümölcsfákhoz, virágokhoz és speciális növényekhez.',
    finalCta: 'Tovább a boltba',
  },
} as const;

function getCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.sk;
}

function toAbsoluteUrl(siteUrl: string, url?: string) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? url : `/${url}`}`;
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
      images: [
        {
          url: `${siteUrl}/images/pages/hakofyt-fertilizers-hero.png`,
          width: 1600,
          height: 900,
          alt: t.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDescription,
      images: [`${siteUrl}/images/pages/hakofyt-fertilizers-hero.png`],
    },
  };
}

export default async function OrganicFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getCopy(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gardenyx.eu';
  const canonical = `${siteUrl}${localeToPath[locale] || localeToPath.sk}`;

  const products = (await getAllProducts(locale))
    .filter((product) =>
      product.categories.some((category) => HAKOFYT_CATEGORY_ORDER.includes(category.slug as typeof HAKOFYT_CATEGORY_ORDER[number])),
    )
    .sort((a, b) => {
      const aCategoryIndex = HAKOFYT_CATEGORY_ORDER.findIndex((slug) => a.categories.some((category) => category.slug === slug));
      const bCategoryIndex = HAKOFYT_CATEGORY_ORDER.findIndex((slug) => b.categories.some((category) => category.slug === slug));
      if (aCategoryIndex !== bCategoryIndex) return aCategoryIndex - bCategoryIndex;
      return a.wcId - b.wcId;
    });

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: t.metaTitle,
        description: t.metaDescription,
        inLanguage: locale,
        isPartOf: {
          '@type': 'WebSite',
          name: 'GardenYX',
          url: siteUrl,
        },
        about: {
          '@type': 'Thing',
          name: t.eyebrow,
        },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/${locale === 'sk' ? 'sk/produkt' : locale === 'hu' ? 'hu/termek' : 'en/product'}/${product.slug}`,
            item: {
              '@type': 'Product',
              name: product.name,
              image: toAbsoluteUrl(siteUrl, product.images[0]?.src),
              description: product.short_description,
              offers: {
                '@type': 'Offer',
                url: `${siteUrl}/${locale === 'sk' ? 'sk/produkt' : locale === 'hu' ? 'hu/termek' : 'en/product'}/${product.slug}`,
                priceCurrency: 'EUR',
                price: parseFloat(product.price).toFixed(2),
                availability: product.stock_status !== 'outofstock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              },
            },
          })),
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
    <main className="bg-[#fbfcf7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="overflow-hidden border-b border-emerald-100 bg-[linear-gradient(180deg,#eff8e8_0%,#fbfcf7_74%)]">
        <div className="container mx-auto grid gap-12 px-6 py-14 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-3xl">
            <p className="w-fit rounded-full bg-emerald-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-50">
              {t.eyebrow}
            </p>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              {t.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/kupit"
                className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                {t.primaryCta}
              </Link>
              <Link
                href="/hnojivo"
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-900 transition hover:border-emerald-500"
              >
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10">
              <Image
                src="/images/pages/hakofyt-fertilizers-hero.png"
                alt={t.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-contain p-6"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{t.heroBadgeTitle}</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">{t.heroBadgeText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">{t.benefitsTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-stone-700">{t.benefitsIntro}</p>
          </div>
          <div className="grid gap-4">
            {t.benefits.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-stone-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-white py-16 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{t.productsEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">{t.productsTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-stone-700">{t.productsDescription}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.wcId} className="group overflow-hidden rounded-2xl border border-stone-200 bg-[#fbfcf7] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="grid h-full">
                  <div className="relative aspect-[4/3] bg-white">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-contain p-6 transition duration-300 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="grid gap-3 p-6">
                    {product.categories[0] ? (
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{product.categories[0].name}</p>
                    ) : null}
                    <h3 className="text-xl font-bold text-stone-950">{product.name}</h3>
                    {product.short_description ? (
                      <p className="line-clamp-3 text-sm leading-6 text-stone-600">{product.short_description}</p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-2xl font-black text-stone-950">{Number(product.price).toFixed(2)} €</span>
                      <span className="text-sm font-bold text-emerald-700">{t.detailLabel}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">{t.compareTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-stone-700">{t.compareText}</p>
          </div>
          <div className="grid gap-4">
            {t.compareItems.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="text-xl font-bold text-stone-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-950 py-16 text-white lg:py-20">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.faqTitle}</h2>
          </div>
          <div className="grid gap-4">
            {t.faqs.map((item) => (
              <div key={item.question} className="border-b border-white/15 pb-5">
                <h3 className="text-lg font-bold">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="rounded-[2rem] bg-emerald-800 px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.finalTitle}</h2>
              <p className="mt-4 text-base leading-7 text-emerald-50">{t.finalText}</p>
            </div>
            <Link
              href="/kupit"
              className="mt-8 inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 lg:mt-0"
            >
              {t.finalCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
