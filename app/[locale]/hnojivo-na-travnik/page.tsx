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
    title: 'Hustý, sýtozelený trávnik začína správnou výživou',
    intro:
      'Hakofyt Max tráva je listové hnojivo špeciálne navrhnuté pre trávniky s vyššou potrebou dusíka. Viditeľný rozdiel pocítite už po prvej aplikácii — intenzívnejšia farba, rovnomernejší rast, vitálnejší porast.',
    primaryCta: 'Pozrieť Hakofyt Max tráva',
    secondaryCta: 'Ako hnojiť trávnik',
    benefits: [
      ['Viditeľný výsledok', 'už po 1. aplikácii'],
      ['Vhodné na jar aj v sezóne', 'flexibilné použitie'],
      ['Listová výživa', 'rýchle vstrebávanie'],
      ['Odporúčané záhradníkmi', 'overená účinnosť'],
    ],
    productEyebrow: 'Odporúčaný produkt',
    productTitle: 'Hakofyt Max tráva',
    productText:
      'Listové hnojivo s vyšším obsahom dusíka pre intenzívnu zelenú farbu, hustejší porast a celkovú kondíciu trávnika. Vhodné na jar po zime aj počas rastovej sezóny.',
    priceLabel: 'Cena',
    outOfStock: 'Na dopyt',
    inStock: 'Skladom',
    detailLabel: 'Detail produktu',
    buyLabel: 'Kúpiť produkt',
    reasonsTitle: 'Kedy siahnuť po hnojive na trávnik',
    reasons: [
      ['Po zime', 'keď trávnik začína rásť a potrebuje doplniť výživu po chladnom období. Prvé hnojenie na jar nastartuje rovnomerný rast.'],
      ['Pri redšom poraste', 'ak chcete podporiť rovnomernejšie zahustenie, tmavšiu farbu a vitálnejší celkový vzhľad trávnika.'],
      ['Po záťaži', 'keď trávnik oslabí sucho, časté kosenie alebo intenzívne používanie záhrady počas letných mesiacov.'],
    ],
    methodTitle: 'Ako správne hnojiť trávnik krok za krokom',
    methodText:
      'Správna aplikácia hnojiva je rovnako dôležitá ako výber produktu. Dodržte jednoduchý postup a výsledky sa dostavia rýchlejšie.',
    steps: [
      { number: '01', title: 'Pripravte trávnik', description: 'Pokošte a odstráňte zvyšky. Najlepší výsledok dosiahnete na očistenom poraste po prvom jarnom kosení.' },
      { number: '02', title: 'Aplikujte hnojivo', description: 'Rozrieďte Hakofyt Max tráva podľa návodu a aplikujte rovnomerne na celý trávnik, ideálne mimo horúčav.' },
      { number: '03', title: 'Zalievajte pravidelne', description: 'Po aplikácii trávnik dôkladne zavlažte. Správna hydratácia urychlí vstrebávanie a viditeľné výsledky.' },
    ],
    faqTitle: 'Časté otázky k hnojivu na trávnik',
    faqs: [
      {
        question: 'Kedy je vhodné použiť hnojivo na trávnik?',
        answer:
          'Najvhodnejšie je obdobie, keď trávnik aktívne rastie. Na jar počkajte, kým pôda preschne a trávnik absolvuje prvé ľahké kosenie. Hnojivo možno opakovane aplikovať počas celej sezóny podľa stavu porastu.',
      },
      {
        question: 'Je Hakofyt Max tráva vhodný ako jarné hnojivo na trávnik?',
        answer:
          'Áno, Hakofyt Max tráva je ideálne jarné hnojivo. Má vyšší obsah dusíka, ktorý podporuje intenzívny zelený rast po zimnom období a pomáha trávniku rýchlo nabrať kondíciu.',
      },
      {
        question: 'Ako rýchlo uvidím výsledky?',
        answer:
          'Listové hnojivá pôsobia rýchlejšie ako granulované — prvé zmeny v sfarbení a rastovej aktivite sú väčšinou viditeľné do 7 – 14 dní od aplikácie za predpokladu dostatočnej závlahy.',
      },
      {
        question: 'Stačí použiť iba hnojivo?',
        answer:
          'Hnojivo funguje najlepšie spolu so správnym kosením (ideálna výška 4–6 cm), primeranou závlahou a odstránením plsti alebo zvyškov po zime. Komplex starostlivosti prináša najlepší výsledok.',
      },
    ],
    ctaTitle: 'Pripravte trávnik na sezónu',
    ctaText: 'Hakofyt Max tráva je dostupný skladom. Objednajte ešte dnes a varovnicou jar sa zazelenáte skôr.',
    ctaBuy: 'Objednať Hakofyt Max tráva',
    ctaDetail: 'Zobraziť detail produktu',
  },
  en: {
    metaTitle: 'Lawn fertilizer Hakofyt Max Grass | GardenYX',
    metaDescription:
      'Looking for a lawn fertilizer for spring and the growing season? Hakofyt Max Grass supports a deep green look, denser growth and lawn vitality.',
    eyebrow: 'Lawn fertilizer',
    title: 'A dense, deep green lawn starts with the right nutrition',
    intro:
      'Hakofyt Max Grass is a foliar fertilizer designed specifically for lawns with higher nitrogen needs. You will notice a visible difference after the very first application — more intense color, more even growth, healthier turf.',
    primaryCta: 'View Hakofyt Max Grass',
    secondaryCta: 'How to fertilize a lawn',
    benefits: [
      ['Visible results', 'from the 1st application'],
      ['Spring & season use', 'flexible application'],
      ['Foliar nutrition', 'fast absorption'],
      ['Trusted by gardeners', 'proven effectiveness'],
    ],
    productEyebrow: 'Recommended product',
    productTitle: 'Hakofyt Max Grass',
    productText:
      'Foliar fertilizer with higher nitrogen content for intense green color, denser growth and overall lawn condition. Suitable for spring after winter as well as throughout the growing season.',
    priceLabel: 'Price',
    outOfStock: 'On request',
    inStock: 'In stock',
    detailLabel: 'Product detail',
    buyLabel: 'Buy product',
    reasonsTitle: 'When to use lawn fertilizer',
    reasons: [
      ['After winter', 'when the lawn starts growing and needs nutrition after the cold period. The first spring application kickstarts even growth.'],
      ['For thinner turf', 'when you want to support more even density, a darker color and a healthier overall appearance.'],
      ['After stress', 'when the lawn is weakened by drought, frequent mowing or intensive garden use during the summer months.'],
    ],
    methodTitle: 'How to fertilize your lawn step by step',
    methodText:
      'Correct application is just as important as choosing the right product. Follow these simple steps and results will come faster.',
    steps: [
      { number: '01', title: 'Prepare the lawn', description: 'Mow and remove clippings. Best results come on a clean lawn after the first spring mowing.' },
      { number: '02', title: 'Apply the fertilizer', description: 'Dilute Hakofyt Max Grass per the instructions and apply evenly over the entire lawn, ideally outside peak heat.' },
      { number: '03', title: 'Water regularly', description: 'After application water the lawn thoroughly. Proper hydration speeds up absorption and visible results.' },
    ],
    faqTitle: 'Lawn fertilizer FAQ',
    faqs: [
      {
        question: 'When should I use lawn fertilizer?',
        answer:
          'Use it when the lawn is actively growing. In spring, wait until the soil dries and the lawn has had its first light mowing. You can reapply throughout the season according to turf condition.',
      },
      {
        question: 'Is Hakofyt Max Grass suitable as a spring lawn fertilizer?',
        answer:
          'Yes. Hakofyt Max Grass is an ideal spring fertilizer. Its higher nitrogen content promotes intense green growth after winter and helps the lawn regain condition quickly.',
      },
      {
        question: 'How fast will I see results?',
        answer:
          'Foliar fertilizers act faster than granular ones — the first changes in color and growth activity are usually visible within 7–14 days of application, given adequate watering.',
      },
      {
        question: 'Is fertilizer alone enough?',
        answer:
          'Fertilizer works best together with correct mowing (ideal height 4–6 cm), adequate watering and removal of thatch or winter debris. A complete care routine delivers the best results.',
      },
    ],
    ctaTitle: 'Get your lawn ready for the season',
    ctaText: 'Hakofyt Max Grass is available in stock. Order today and enjoy a green lawn sooner this spring.',
    ctaBuy: 'Order Hakofyt Max Grass',
    ctaDetail: 'View product detail',
  },
  hu: {
    metaTitle: 'Gyeptrágya Hakofyt Max gyep | GardenYX',
    metaDescription:
      'Gyeptrágyát keres tavaszra és a szezonra? A Hakofyt Max gyep támogatja a mélyzöld megjelenést, a sűrűbb növekedést és a gyep vitalitását.',
    eyebrow: 'Gyeptrágya',
    title: 'A sűrű, mélyzöld gyep a megfelelő tápanyaggal kezdődik',
    intro:
      'A Hakofyt Max gyep lombtrágya kifejezetten magasabb nitrogénigényű gyepekhez fejlesztve. Az első alkalmazás után már látható a különbség — intenzívebb szín, egyenletesebb növekedés, egészségesebb gyep.',
    primaryCta: 'Hakofyt Max gyep megtekintése',
    secondaryCta: 'Gyeptrágyázási útmutató',
    benefits: [
      ['Látható eredmény', 'már az 1. alkalmazástól'],
      ['Tavaszi és szezonális', 'rugalmas felhasználás'],
      ['Lombtrágya', 'gyors felszívódás'],
      ['Kertészek ajánlásával', 'bevált hatékonyság'],
    ],
    productEyebrow: 'Ajánlott termék',
    productTitle: 'Hakofyt Max gyep',
    productText:
      'Magasabb nitrogéntartalmú lombtrágya az intenzív zöld színért, sűrűbb növekedésért és a gyep általános kondíciójáért. Alkalmas tavasszal tél után és az egész vegetációs időszakban.',
    priceLabel: 'Ár',
    outOfStock: 'Rendelésre',
    inStock: 'Raktáron',
    detailLabel: 'Termék részletei',
    buyLabel: 'Termék vásárlása',
    reasonsTitle: 'Mikor érdemes gyeptrágyát használni',
    reasons: [
      ['Tél után', 'amikor a gyep növekedni kezd, és tápanyagpótlásra van szüksége. Az első tavaszi trágyázás egyenletes növekedést indít el.'],
      ['Ritkább gyepnél', 'ha egyenletesebb sűrűséget, sötétebb színt és egészségesebb megjelenést szeretne.'],
      ['Stressz után', 'amikor a gyepet aszály, gyakori nyírás vagy intenzív nyári kerthasználat gyengítette.'],
    ],
    methodTitle: 'A gyeptrágyázás lépésről lépésre',
    methodText:
      'A helyes alkalmazás éppoly fontos, mint a megfelelő termék kiválasztása. Kövesse az egyszerű lépéseket, és az eredmények hamarabb megjelennek.',
    steps: [
      { number: '01', title: 'Készítse elő a gyepet', description: 'Nyírja le és távolítsa el a nyesedéket. A legjobb eredmény az első tavaszi nyírás utáni, megtisztított gyepen érhető el.' },
      { number: '02', title: 'Alkalmazza a trágyát', description: 'Hígítsa a Hakofyt Max gyepet az útmutató szerint, és egyenletesen vigye fel az egész gyepre, lehetőleg hőség nélkül.' },
      { number: '03', title: 'Rendszeresen öntözze', description: 'Az alkalmazás után alaposan öntözze meg a gyepet. A megfelelő hidratáció felgyorsítja a felszívódást és a látható eredményeket.' },
    ],
    faqTitle: 'Gyakori kérdések a gyeptrágyáról',
    faqs: [
      {
        question: 'Mikor érdemes gyeptrágyát használni?',
        answer:
          'Akkor, amikor a gyep aktívan növekszik. Tavasszal várja meg, amíg a talaj felszárad és megtörténik az első enyhe fűnyírás. A szezon során a gyep állapota szerint ismételheti az alkalmazást.',
      },
      {
        question: 'A Hakofyt Max gyep alkalmas tavaszi gyeptrágyának?',
        answer:
          'Igen. A Hakofyt Max gyep ideális tavaszi trágya. Magasabb nitrogéntartalma intenzív zöld növekedést segít elő tél után, és gyorsan visszaállítja a gyep kondícióját.',
      },
      {
        question: 'Milyen gyorsan látok eredményt?',
        answer:
          'A lombtrágyák gyorsabban hatnak, mint a szemcsések — a szín és a növekedési aktivitás első változásai általában 7–14 nappal az alkalmazás után láthatók, megfelelő öntözés esetén.',
      },
      {
        question: 'Elég önmagában a trágya?',
        answer:
          'A trágya megfelelő fűnyírással (ideális magasság 4–6 cm), elegendő öntözéssel és a filcréteg vagy téli maradványok eltávolításával működik a legjobban. A komplex gondozás hozza a legjobb eredményt.',
      },
    ],
    ctaTitle: 'Készítse fel gyepét a szezonra',
    ctaText: 'A Hakofyt Max gyep raktáron elérhető. Rendelje meg még ma, és gyepje hamarabb zöldüljön ki.',
    ctaBuy: 'Hakofyt Max gyep rendelése',
    ctaDetail: 'Termék részleteinek megtekintése',
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

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-emerald-100">
        <div className="absolute inset-0 -z-10 bg-[#f8f8f3]" />
        <div className="absolute bottom-0 left-0 right-0 -z-10 h-32 bg-gradient-to-t from-[#f8f8f3] to-transparent" />

        <div className="container mx-auto grid min-h-[calc(100vh-5rem)] items-center gap-12 px-6 py-16 lg:grid-cols-2">
          {/* Left — text */}
          <div>
            <p className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">
              {t.eyebrow}
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700 sm:text-xl sm:leading-9">
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

            {/* Quick benefits */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {t.benefits.map(([label, sub]) => (
                <div key={label} className="flex flex-col gap-1 border-l-2 border-emerald-300 pl-3">
                  <span className="text-sm font-bold text-stone-950">{label}</span>
                  <span className="text-xs text-stone-500">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — product card */}
          <div className="flex items-center justify-center">
            <article className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-stone-200/80">
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="relative block h-64 bg-stone-50">
                {productImage ? (
                  <Image
                    src={productImage.src}
                    alt={productImage.alt || product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                ) : null}
              </Link>
              <div className="flex flex-col p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{product.categories[0]?.name || 'Hakofyt'}</p>
                <h2 className="mt-2 text-2xl font-bold text-stone-950">{product.name}</h2>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-500">{t.priceLabel}</p>
                    <p className="mt-1 text-3xl font-bold text-stone-950">{Number(product.price).toFixed(2)} €</p>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${product.stock_status === 'outofstock' ? 'bg-stone-100 text-stone-600' : 'bg-emerald-50 text-emerald-800'}`}>
                    {product.stock_status === 'outofstock' ? t.outOfStock : t.inStock}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
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
        </div>
      </section>

      {/* When to use */}
      <section className="border-y border-emerald-100 bg-white py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-950">{t.reasonsTitle}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {t.reasons.map(([title, description]) => (
              <article key={title} className="group relative rounded-2xl bg-[#f8f8f3] p-7 ring-1 ring-emerald-100 transition hover:ring-emerald-300">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <span className="text-lg text-emerald-700">✦</span>
                </div>
                <h3 className="text-xl font-bold text-stone-950">{title}</h3>
                <p className="mt-3 text-base leading-7 text-stone-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How to use — steps */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-stone-950">{t.methodTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-stone-700">{t.methodText}</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {t.steps.map((step) => (
              <div key={step.number} className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-100">
                <span className="block text-5xl font-black text-emerald-100 leading-none">{step.number}</span>
                <h3 className="mt-4 text-xl font-bold text-stone-950">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold tracking-tight text-stone-950">{t.faqTitle}</h2>
            <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {t.faqs.map((item) => (
                <article key={item.question} className="py-7">
                  <h3 className="text-xl font-semibold text-stone-950">{item.question}</h3>
                  <p className="mt-3 text-base leading-7 text-stone-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-emerald-100 bg-emerald-700 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{t.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-100">{t.ctaText}</p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
            >
              {t.ctaBuy}
            </Link>
            <Link
              href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
              className="inline-flex items-center justify-center rounded-full border border-emerald-400 px-8 py-4 text-sm font-bold text-white transition hover:border-white"
            >
              {t.ctaDetail}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
