import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getAllProducts } from '@/app/lib/products';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const HAKOFYT_CATEGORY_ORDER = [
  'hnojiva-hakofyt-max',
  'hnojiva-hakofyt-plus',
  'hnojiva-hakofyt-b',
] as const;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo',
  en: '/en/fertilizer',
  hu: '/hu/mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo pre záhradu, trávnik a rastliny | GardenYX',
    metaDescription:
      'Vyberte si listové hnojivo Hakofyt pre trávnik, zeleninu, ovocné stromy, kvety, čučoriedky, jahody aj citrusy. GardenYX poradí s výberom a dávkovaním.',
    eyebrow: 'Hnojivá GardenYX',
    title: 'Hnojivo pre zdravý trávnik, silné rastliny a bohatšiu úrodu',
    intro:
      'Listové hnojivá Hakofyt spájajú NPK živiny, mikroprvky a prírodné stimulátory rastu. Vyberte si výživu podľa toho, čo pestujete: trávnik, zeleninu, ovocné stromy, kvety alebo špecializované plodiny.',
    primaryCta: 'Vybrať hnojivo',
    secondaryCta: 'Ako funguje Hakofyt',
    imageNoteTitle: 'NPK + mikroprvky',
    imageNoteText: 'Hakofyt kombinuje živiny pre rast, kvitnutie, úrodu aj odolnosť rastlín.',
    featuredEyebrow: 'Odporúčané produkty',
    featuredTitle: 'Hnojivá podľa použitia',
    featuredDescription:
      'Prehľad najdôležitejších hnojív z aktuálneho sortimentu GardenYX. Každý produkt má vlastné použitie, dávkovanie a cieľový typ rastlín.',
    detailLabel: 'Detail',
    usesTitle: 'Ako si vybrať správne hnojivo',
    usesIntro:
      'Najrýchlejšia cesta k správnemu výberu je začať od rastliny, nie od zloženia. Iné hnojivo potrebuje trávnik po zime, iné mladé sadenice a iné ovocné stromy počas tvorby plodov.',
    uses: [
      {
        title: 'Trávnik',
        text: 'Ak chcete sýtozelený a hustejší porast, vyberte hnojivo s vyšším obsahom dusíka a železom.',
        href: '/hnojivo-na-travnik',
        label: 'Hnojivo na trávnik',
      },
      {
        title: 'Ovocné stromy',
        text: 'Pri jabloniach, hruškách, slivkách a čerešniach sa oplatí cieliť na kvitnutie, kvalitu plodov a vitalitu výhonov.',
        href: '/hnojivo-na-ovocne-stromy',
        label: 'Hnojivo na ovocné stromy',
      },
      {
        title: 'Zelenina a sadenice',
        text: 'Zelenina potrebuje vyvážené NPK, stopové prvky a pravidelnú výživu počas rastu aj tvorby úrody.',
        href: '/hnojivo-na-zeleninu',
        label: 'Hnojivo na zeleninu',
      },
      {
        title: 'Kvety',
        text: 'Kvitnúce rastliny ocenia vyšší dôraz na fosfor, draslík a bór pre bohatšie kvitnutie.',
        href: '/hnojivo-na-kvety',
        label: 'Hnojivo na kvety',
      },
    ],
    methodTitle: 'Prečo listové hnojivo',
    methodText:
      'Listové hnojivo sa aplikuje postrekom alebo zálievkou podľa návodu. Pri listovej aplikácii sa živiny dostávajú priamo cez listy, preto vie rastlina reagovať rýchlejšie najmä v období stresu, sucha alebo intenzívneho rastu.',
    pillars: [
      ['NPK živiny', 'Dusík podporuje rast listov, fosfor korene a kvitnutie, draslík odolnosť a kvalitu úrody.'],
      ['Mikroprvky', 'Železo, zinok, horčík, mangán, meď, bór a molybdén dopĺňajú živiny, ktoré často rozhodujú o vitalite.'],
      ['Prírodné stimulátory', 'Humínové látky, aminokyseliny a sacharidy pomáhajú rastline lepšie využiť dodanú výživu.'],
    ],
    faqTitle: 'Časté otázky k hnojivám',
    faqs: [
      {
        question: 'Aké hnojivo je najlepšie pre záhradu?',
        answer:
          'Najlepšie hnojivo závisí od rastliny a sezóny. Pre trávnik je vhodný Hakofyt Max tráva, pre zeleninu Hakofyt Plus zelenina, pre ovocné stromy Hakofyt Plus na ovocné dreviny a pre kvety Hakofyt B kvety.',
      },
      {
        question: 'Čo znamená NPK hnojivo?',
        answer:
          'NPK označuje tri hlavné živiny: dusík, fosfor a draslík. Ich pomer rozhoduje o raste listov, koreňov, kvetov, plodov a celkovej odolnosti rastlín.',
      },
      {
        question: 'Kedy používať hnojivo?',
        answer:
          'Najčastejšie počas vegetačnej sezóny, keď rastliny aktívne rastú. Pri trávniku je dôležitá jar, pri zelenine a ovocných stromoch aj opakovaná výživa počas sezóny.',
      },
      {
        question: 'Je listové hnojivo vhodné aj pre hobby záhradu?',
        answer:
          'Áno. Pri dodržaní návodu je vhodné pre hobby pestovateľov aj profesionálov. Výhodou je jednoduchá aplikácia a rýchlejší príjem živín cez listy.',
      },
    ],
    finalTitle: 'Začnite výberom podľa rastliny',
    finalText:
      'Ak si nie ste istí zložením, začnite konkrétnym použitím: trávnik, ovocné stromy, zelenina, kvety alebo špecializované plodiny. GardenYX sortiment je postavený presne týmto spôsobom.',
    finalCta: 'Prejsť do obchodu',
  },
  en: {
    metaTitle: 'Fertilizer for garden, lawn and plants | GardenYX',
    metaDescription:
      'Choose Hakofyt foliar fertilizer for lawns, vegetables, fruit trees, flowers, blueberries, strawberries and citrus plants. GardenYX helps you choose and dose correctly.',
    eyebrow: 'GardenYX fertilizers',
    title: 'Fertilizer for a healthy lawn, stronger plants and richer harvests',
    intro:
      'Hakofyt foliar fertilizers combine NPK nutrients, micro-elements and natural growth stimulators. Choose nutrition by what you grow: lawn, vegetables, fruit trees, flowers or specialty crops.',
    primaryCta: 'Choose fertilizer',
    secondaryCta: 'How Hakofyt works',
    imageNoteTitle: 'NPK + micro-elements',
    imageNoteText: 'Hakofyt combines nutrients for growth, flowering, harvest quality and plant resistance.',
    featuredEyebrow: 'Recommended products',
    featuredTitle: 'Fertilizers by use',
    featuredDescription:
      'An overview of the most important fertilizers in the current GardenYX range. Each product has its own use case, dosing and target plant group.',
    detailLabel: 'Detail',
    usesTitle: 'How to choose the right fertilizer',
    usesIntro:
      'The fastest way to choose correctly is to start with the plant, not the formula. A lawn after winter needs different nutrition than young seedlings or fruit trees during fruit formation.',
    uses: [
      {
        title: 'Lawn',
        text: 'For a deep green and denser lawn, choose fertilizer with higher nitrogen content and iron.',
        href: '/hnojivo-na-travnik',
        label: 'Lawn fertilizer',
      },
      {
        title: 'Fruit trees',
        text: 'For apples, pears, plums and cherries, focus on flowering, fruit quality and shoot vitality.',
        href: '/hnojivo-na-ovocne-stromy',
        label: 'Fruit tree fertilizer',
      },
      {
        title: 'Vegetables and seedlings',
        text: 'Vegetables need balanced NPK, trace elements and regular nutrition during growth and harvest formation.',
        href: '/hnojivo-na-zeleninu',
        label: 'Vegetable fertilizer',
      },
      {
        title: 'Flowers',
        text: 'Flowering plants benefit from more phosphorus, potassium and boron for richer blooming.',
        href: '/hnojivo-na-kvety',
        label: 'Flower fertilizer',
      },
    ],
    methodTitle: 'Why foliar fertilizer',
    methodText:
      'Foliar fertilizer is applied by spray or watering according to the instructions. Through foliar application, nutrients enter directly through the leaves, so plants can respond faster during stress, drought or intensive growth.',
    pillars: [
      ['NPK nutrients', 'Nitrogen supports leaf growth, phosphorus roots and flowering, potassium resistance and crop quality.'],
      ['Micro-elements', 'Iron, zinc, magnesium, manganese, copper, boron and molybdenum often decide plant vitality.'],
      ['Natural stimulators', 'Humic substances, amino acids and carbohydrates help plants use supplied nutrition more efficiently.'],
    ],
    faqTitle: 'Fertilizer FAQ',
    faqs: [
      {
        question: 'What is the best garden fertilizer?',
        answer:
          'The best fertilizer depends on the plant and season. Hakofyt Max Lawn fits lawns, Hakofyt Plus Vegetables fits vegetables, Hakofyt Plus Fruit Trees fits fruit trees, and Hakofyt B Flowers fits flowering plants.',
      },
      {
        question: 'What does NPK fertilizer mean?',
        answer:
          'NPK stands for nitrogen, phosphorus and potassium. Their ratio influences leaf growth, roots, flowers, fruit and overall plant resistance.',
      },
      {
        question: 'When should I use fertilizer?',
        answer:
          'Most often during the growing season when plants actively grow. Spring is key for lawns, while vegetables and fruit trees benefit from repeated nutrition during the season.',
      },
      {
        question: 'Is foliar fertilizer suitable for hobby gardens?',
        answer:
          'Yes. When used according to the label, it fits hobby growers and professionals. The advantage is simple application and faster nutrient intake through the leaves.',
      },
    ],
    finalTitle: 'Start by choosing the plant',
    finalText:
      'If you are unsure about the formula, start with the use case: lawn, fruit trees, vegetables, flowers or specialty crops. The GardenYX range is built exactly this way.',
    finalCta: 'Go to shop',
  },
  hu: {
    metaTitle: 'Műtrágya kerthez, gyephez és növényekhez | GardenYX',
    metaDescription:
      'Válasszon Hakofyt lombtrágyát gyephez, zöldségekhez, gyümölcsfákhoz, virágokhoz, áfonyához, eperhez és citrusokhoz. A GardenYX segít a választásban és adagolásban.',
    eyebrow: 'GardenYX műtrágyák',
    title: 'Műtrágya egészséges gyephez, erősebb növényekhez és gazdagabb terméshez',
    intro:
      'A Hakofyt lombtrágyák NPK tápanyagokat, mikroelemeket és természetes növekedésserkentőket kombinálnak. Válasszon tápanyagot aszerint, mit termeszt: gyepet, zöldséget, gyümölcsfát, virágot vagy speciális növényeket.',
    primaryCta: 'Műtrágya kiválasztása',
    secondaryCta: 'Hogyan működik a Hakofyt',
    imageNoteTitle: 'NPK + mikroelemek',
    imageNoteText: 'A Hakofyt a növekedéshez, virágzáshoz, terméshez és ellenálláshoz szükséges tápanyagokat kombinálja.',
    featuredEyebrow: 'Ajánlott termékek',
    featuredTitle: 'Műtrágyák felhasználás szerint',
    featuredDescription:
      'A GardenYX aktuális kínálatának legfontosabb műtrágyái. Minden terméknek saját felhasználása, adagolása és célzott növénycsoportja van.',
    detailLabel: 'Részletek',
    usesTitle: 'Hogyan válasszon megfelelő műtrágyát',
    usesIntro:
      'A leggyorsabb út a helyes választáshoz, ha nem az összetételből, hanem a növényből indul ki. Más tápanyagra van szüksége a tél utáni gyepnek, a palántáknak és a termést nevelő gyümölcsfáknak.',
    uses: [
      {
        title: 'Gyep',
        text: 'Mélyzöld és sűrűbb gyephez válasszon magasabb nitrogéntartalmú, vasat is tartalmazó műtrágyát.',
        href: '/hnojivo-na-travnik',
        label: 'Gyeptrágya',
      },
      {
        title: 'Gyümölcsfák',
        text: 'Almánál, körténél, szilvánál és cseresznyénél a virágzásra, gyümölcsminőségre és hajtásvitalitásra érdemes figyelni.',
        href: '/hnojivo-na-ovocne-stromy',
        label: 'Gyümölcsfa trágya',
      },
      {
        title: 'Zöldségek és palánták',
        text: 'A zöldségek kiegyensúlyozott NPK-t, nyomelemeket és rendszeres tápanyagellátást igényelnek.',
        href: '/hnojivo-na-zeleninu',
        label: 'Zöldség műtrágya',
      },
      {
        title: 'Virágok',
        text: 'A virágzó növények több foszfort, káliumot és bórt igényelnek a gazdagabb virágzáshoz.',
        href: '/hnojivo-na-kvety',
        label: 'Virág műtrágya',
      },
    ],
    methodTitle: 'Miért lombtrágya',
    methodText:
      'A lombtrágya permetezéssel vagy öntözéssel alkalmazható az útmutató szerint. Lombon keresztül a tápanyagok közvetlenül jutnak be, ezért a növény gyorsabban reagálhat stressz, szárazság vagy intenzív növekedés idején.',
    pillars: [
      ['NPK tápanyagok', 'A nitrogén a levélnövekedést, a foszfor a gyökereket és virágzást, a kálium az ellenállást és termésminőséget támogatja.'],
      ['Mikroelemek', 'A vas, cink, magnézium, mangán, réz, bór és molibdén gyakran dönt a növény vitalitásáról.'],
      ['Természetes serkentők', 'A huminsavak, aminosavak és szénhidrátok segítik a növényt a tápanyagok hatékonyabb felhasználásában.'],
    ],
    faqTitle: 'Gyakori kérdések a műtrágyákról',
    faqs: [
      {
        question: 'Melyik a legjobb kerti műtrágya?',
        answer:
          'A legjobb műtrágya a növénytől és az évszaktól függ. Gyephez a Hakofyt Max Gyep, zöldséghez a Hakofyt Plus Zöldség, gyümölcsfákhoz a Hakofyt Plus Gyümölcsfák, virágokhoz a Hakofyt B Virágok megfelelő.',
      },
      {
        question: 'Mit jelent az NPK műtrágya?',
        answer:
          'Az NPK a nitrogént, foszfort és káliumot jelöli. Arányuk befolyásolja a levelek, gyökerek, virágok, termések és a növény ellenálló képességét.',
      },
      {
        question: 'Mikor használjak műtrágyát?',
        answer:
          'Leggyakrabban a vegetációs időszakban, amikor a növények aktívan növekednek. Gyepnél a tavasz kulcsfontosságú, zöldségeknél és gyümölcsfáknál a szezon közbeni ismételt tápanyagellátás is fontos.',
      },
      {
        question: 'A lombtrágya alkalmas hobbikertbe is?',
        answer:
          'Igen. A címke betartása mellett hobbikertészeknek és profiknak is alkalmas. Előnye az egyszerű alkalmazás és a gyorsabb tápanyagfelvétel a leveleken keresztül.',
      },
    ],
    finalTitle: 'Kezdje a növénnyel',
    finalText:
      'Ha bizonytalan az összetételben, induljon ki a felhasználásból: gyep, gyümölcsfák, zöldségek, virágok vagy speciális növények. A GardenYX kínálata pontosan így épül fel.',
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
          url: `${siteUrl}/hnojiva.webp`,
          width: 1200,
          height: 800,
          alt: t.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDescription,
      images: [`${siteUrl}/hnojiva.webp`],
    },
  };
}

export default async function FertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
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
          name: 'Hnojivo',
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
              sku: product.sku || product.id.toString(),
              mpn: product.sku || product.slug,
              brand: {
                '@type': 'Brand',
                name: 'Hakofyt',
              },
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

      <section className="overflow-hidden border-b border-emerald-100 bg-[linear-gradient(180deg,#eef8e8_0%,#fbfcf7_72%)]">
        <div className="container mx-auto grid gap-12 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
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
                href="/hnojiva-hakofyt"
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-900 transition hover:border-emerald-500"
              >
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10">
              <Image
                src="/hnojiva.webp"
                alt={t.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{t.imageNoteTitle}</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {t.imageNoteText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{t.featuredEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">{t.featuredTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-stone-700">{t.featuredDescription}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.wcId} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="grid h-full">
                  <div className="relative aspect-[4/3] bg-stone-50">
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

      <section className="border-y border-emerald-100 bg-white py-16 lg:py-20">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">{t.usesTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-stone-700">{t.usesIntro}</p>
          </div>
          <div className="grid gap-4">
            {t.uses.map((item) => (
              <Link
                key={item.title}
                href={item.href as AnyHref}
                className="rounded-2xl border border-stone-200 bg-[#fbfcf7] p-6 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <h3 className="text-xl font-bold text-stone-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{item.text}</p>
                <span className="mt-4 inline-flex text-sm font-bold text-emerald-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">{t.methodTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-stone-700">{t.methodText}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.pillars.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm">
                <h3 className="text-xl font-bold text-stone-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-700">{text}</p>
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
