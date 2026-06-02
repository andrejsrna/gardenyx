import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-b-cucoriedky';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-cucoriedky',
  en: '/en/blueberry-fertilizer',
  hu: '/hu/afonya-mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const npkArticleSlug: Record<string, string> = {
  sk: 'npk-hnojivo-co-znamena',
  en: 'npk-fertilizer-meaning',
  hu: 'npk-mutragya-jelentese',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na čučoriedky pre kyslomilné rastliny | GardenYX',
    metaDescription:
      'Hakofyt B čučoriedky je listové hnojivo na čučoriedky a kyslomilné rastliny. Podporuje vitalitu, listy, kvitnutie aj kvalitu úrody bez zbytočného preťaženia pôdy.',
    eyebrow: 'Hnojivo na čučoriedky',
    title: 'Hnojivo na čučoriedky pre zdravé listy, lepší rast a kvalitnejšiu úrodu',
    intro:
      'Čučoriedky patria medzi kyslomilné rastliny, preto potrebujú citlivejší prístup než univerzálne hnojivo. Hakofyt B čučoriedky je listové hnojivo navrhnuté pre čučoriedky a podobné druhy, keď chcete podporiť vitalitu, rast, kvitnutie aj tvorbu plodov bez zbytočného zaťaženia pôdy.',
    primaryCta: 'Kúpiť hnojivo na čučoriedky',
    secondaryCta: 'Pozrieť všetky hnojivá',
    productEyebrow: 'Odporúčaný produkt',
    productText:
      'Listové hnojivo pre čučoriedky a ďalšie kyslomilné rastliny. Vhodné, keď chcete cielene podporiť listy, rast a úrodu bez hrubého zásahu do substrátu.',
    priceLabel: 'Cena od',
    inStock: 'Skladom',
    outOfStock: 'Na dopyt',
    detailLabel: 'Detail produktu',
    useTitle: 'Kedy použiť hnojivo na čučoriedky',
    uses: [
      ['Po jarnom štarte', 'keď rastlina začína rásť a potrebuje podporiť listovú plochu a vitalitu po zime.'],
      ['Pred kvitnutím a po odkvitnutí', 'keď chcete podporiť kondíciu rastliny a pripraviť ju na tvorbu plodov.'],
      ['Počas sezóny pri oslabenej vitalite', 'keď listy pôsobia slabo, rast sa spomaľuje alebo rastlina potrebuje jemnú doplnkovú výživu.'],
    ],
    applyTitle: 'Ako hnojiť čučoriedky šetrne a účinne',
    steps: [
      ['01', 'Dodržte dávkovanie z etikety', 'Pri listovom hnojive pre čučoriedky je dôležité držať sa odporúčaného riedenia a intervalu aplikácie.'],
      ['02', 'Aplikujte mimo ostrého slnka', 'Najlepšie skoro ráno alebo večer, keď listy nie sú prehriate a rastlina nie je v strese.'],
      ['03', 'Sledujte aj podmienky substrátu', 'Listové hnojivo pomáha výžive, ale pri čučoriedkach je stále dôležité udržiavať vhodné kyslé prostredie a neprehnojiť pôdu.'],
    ],
    relatedTitle: 'Súvisiace témy',
    related: [
      ['/hnojivo', 'Hnojivo pre záhradu'],
      ['/organicke-hnojivo', 'Organické hnojivo'],
      ['npkArticle', 'Čo znamená NPK hnojivo'],
    ],
    faqTitle: 'Časté otázky k hnojivu na čučoriedky',
    faqs: [
      ['Aké hnojivo je vhodné na čučoriedky?', 'Čučoriedkam vyhovuje cielené hnojivo pre kyslomilné rastliny. Hakofyt B čučoriedky je vhodný ako listová výživa na podporu vitality, listov a úrody.'],
      ['Môžem čučoriedky hnojiť univerzálnym hnojivom?', 'Skôr opatrne. Čučoriedky sú citlivejšie na podmienky substrátu, preto je vhodnejšie siahnuť po cielenejšom riešení pre kyslomilné rastliny.'],
      ['Kedy hnojiť čučoriedky?', 'Najčastejšie na jar po štarte vegetácie, pred kvitnutím, po odkvitnutí a potom podľa kondície rastliny počas sezóny.'],
      ['Stačí listové hnojivo samo o sebe?', 'Listové hnojivo je veľmi praktické ako doplnková výživa. Popri tom však treba sledovať aj pH substrátu, zálievku a celkový stav pôdy.'],
    ],
  },
  en: {
    metaTitle: 'Blueberry fertilizer for acid-loving plants | GardenYX',
    metaDescription:
      'Hakofyt B Blueberries is foliar fertilizer for blueberries and acid-loving plants. It supports vitality, leaf health, flowering and crop quality without overloading the soil.',
    eyebrow: 'Blueberry fertilizer',
    title: 'Blueberry fertilizer for healthy leaves, stronger growth and better fruit quality',
    intro:
      'Blueberries are acid-loving plants, so they need a gentler approach than a universal fertilizer. Hakofyt B Blueberries is a foliar fertilizer designed for blueberries and similar crops when you want to support vitality, growth, flowering and fruit formation without unnecessary soil stress.',
    primaryCta: 'Buy blueberry fertilizer',
    secondaryCta: 'View all fertilizers',
    productEyebrow: 'Recommended product',
    productText:
      'Foliar fertilizer for blueberries and other acid-loving plants. Suitable when you want targeted support for leaves, growth and harvest quality without harsh substrate intervention.',
    priceLabel: 'Price from',
    inStock: 'In stock',
    outOfStock: 'On request',
    detailLabel: 'Product detail',
    useTitle: 'When to use blueberry fertilizer',
    uses: [
      ['After spring start', 'when the plant resumes growth and needs support for leaf area and vitality after winter.'],
      ['Before flowering and after bloom', 'when you want to support plant condition and prepare it for fruit set.'],
      ['During the season in lower vitality', 'when leaves look weak, growth slows down or the plant needs gentle supplemental nutrition.'],
    ],
    applyTitle: 'How to fertilize blueberries gently and effectively',
    steps: [
      ['01', 'Follow the label dosage', 'For foliar blueberry fertilizer, it is important to keep the recommended dilution and application interval.'],
      ['02', 'Apply outside harsh sun', 'Best early in the morning or in the evening, when leaves are not overheated and the plant is not under stress.'],
      ['03', 'Also watch substrate conditions', 'Foliar fertilizer helps nutrition, but blueberries still need suitable acidic conditions and care not to overload the soil.'],
    ],
    relatedTitle: 'Related topics',
    related: [
      ['/hnojivo', 'Garden fertilizer'],
      ['/organicke-hnojivo', 'Organic fertilizer'],
      ['npkArticle', 'What NPK fertilizer means'],
    ],
    faqTitle: 'Blueberry fertilizer FAQ',
    faqs: [
      ['What fertilizer is suitable for blueberries?', 'Blueberries respond best to targeted fertilizer for acid-loving plants. Hakofyt B Blueberries works well as foliar nutrition for vitality, leaf health and crop quality.'],
      ['Can I use a universal fertilizer on blueberries?', 'Use caution. Blueberries are more sensitive to substrate conditions, so a more targeted solution for acid-loving plants is usually better.'],
      ['When should I fertilize blueberries?', 'Most often in spring after vegetation starts, before flowering, after bloom and then according to plant condition during the season.'],
      ['Is foliar fertilizer enough on its own?', 'Foliar fertilizer is very practical as supplemental nutrition, but you should also watch substrate pH, watering and overall soil condition.'],
    ],
  },
  hu: {
    metaTitle: 'Áfonya műtrágya savanyú talajt kedvelő növényekhez | GardenYX',
    metaDescription:
      'A Hakofyt B Áfonya lombtrágya áfonyához és savanyú közeget kedvelő növényekhez. Támogatja a vitalitást, a lombot, a virágzást és a termésminőséget a talaj túlterhelése nélkül.',
    eyebrow: 'Áfonya műtrágya',
    title: 'Áfonya műtrágya egészséges lombhoz, erősebb növekedéshez és jobb terméshez',
    intro:
      'Az áfonya savanyú közeget kedvelő növény, ezért kíméletesebb megközelítést igényel, mint egy univerzális műtrágya. A Hakofyt B Áfonya olyan lombtrágya, amelyet áfonyához és hasonló növényekhez terveztek, ha a vitalitást, növekedést, virágzást és termésképzést szeretné támogatni fölösleges talajterhelés nélkül.',
    primaryCta: 'Áfonya műtrágya vásárlása',
    secondaryCta: 'Minden műtrágya',
    productEyebrow: 'Ajánlott termék',
    productText:
      'Lombtrágya áfonyához és más savanyú közeget kedvelő növényekhez. Akkor ideális, ha célzottan szeretné támogatni a lombot, a növekedést és a termés minőségét.',
    priceLabel: 'Ár ettől',
    inStock: 'Raktáron',
    outOfStock: 'Rendelésre',
    detailLabel: 'Termék részletei',
    useTitle: 'Mikor használjon áfonya műtrágyát',
    uses: [
      ['Tavaszi indulás után', 'amikor a növény újra növekedni kezd, és támogatásra van szüksége a lombhoz és a vitalitáshoz.'],
      ['Virágzás előtt és után', 'amikor a növény kondícióját és a terméskötés előkészítését szeretné támogatni.'],
      ['Szezon közben gyengébb vitalitásnál', 'amikor a levelek gyengébbek, a növekedés lelassul vagy kíméletes kiegészítő tápanyagellátás kell.'],
    ],
    applyTitle: 'Hogyan trágyázza az áfonyát kíméletesen és hatékonyan',
    steps: [
      ['01', 'Tartsa be a címke szerinti adagolást', 'Az áfonyához való lombtrágyánál fontos az ajánlott hígítás és kijuttatási gyakoriság betartása.'],
      ['02', 'Ne erős napsütésben alkalmazza', 'Legjobb kora reggel vagy este, amikor a levelek nem forrók és a növény nincs stresszben.'],
      ['03', 'Figyelje a közeg állapotát is', 'A lombtrágya segíti a tápanyagellátást, de az áfonyánál továbbra is fontos a megfelelő savanyú közeg és a talaj túltrágyázásának kerülése.'],
    ],
    relatedTitle: 'Kapcsolódó témák',
    related: [
      ['/hnojivo', 'Kerti műtrágya'],
      ['/organicke-hnojivo', 'Szerves műtrágya'],
      ['npkArticle', 'Mit jelent az NPK'],
    ],
    faqTitle: 'Gyakori kérdések az áfonya műtrágyához',
    faqs: [
      ['Milyen műtrágya alkalmas áfonyához?', 'Az áfonya a savanyú közeget kedvelő növényekhez készült célzott műtrágyára reagál a legjobban. A Hakofyt B Áfonya lombon keresztüli tápanyagellátásként jó választás a vitalitás, a lomb és a termés támogatására.'],
      ['Használhatok univerzális műtrágyát áfonyára?', 'Óvatosan. Az áfonya érzékenyebb a közeg állapotára, ezért általában jobb a savanyú közeget kedvelő növényekhez való célzott megoldás.'],
      ['Mikor trágyázzuk az áfonyát?', 'Leggyakrabban tavasszal a vegetáció indulása után, virágzás előtt, virágzás után, majd a növény állapota szerint a szezon során.'],
      ['Elég önmagában a lombtrágya?', 'A lombtrágya nagyon praktikus kiegészítő tápanyagellátás, de emellett figyelni kell a közeg pH-jára, az öntözésre és a talaj általános állapotára is.'],
    ],
  },
} as const;

function getCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.sk;
}

function stripHtml(value?: string) {
  return value?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
}

function localizedProductPath(locale: string, slug: string) {
  if (locale === 'en') return `/en/product/${slug}`;
  if (locale === 'hu') return `/hu/termek/${slug}`;
  return `/sk/produkt/${slug}`;
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
        Object.entries(localeToPath).map(([alternateLocale, path]) => [alternateLocale, `${siteUrl}${path}`])
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

export default async function BlueberryFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getCopy(locale);
  const product = await getProductBySlug(PRODUCT_SLUG, locale);

  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gardenyx.eu';
  const canonical = `${siteUrl}${localeToPath[locale] || localeToPath.sk}`;
  const productUrl = `${siteUrl}${localizedProductPath(locale, product.slug)}`;
  const productImage = product.images[0];
  const productDescription = stripHtml(product.short_description) || t.productText;

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: t.metaTitle,
        description: t.metaDescription,
        inLanguage: locale,
        mainEntity: { '@id': `${productUrl}#product` },
      },
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: productDescription,
        image: productImage?.src || undefined,
        sku: product.sku || undefined,
        brand: { '@type': 'Brand', name: 'Hakofyt' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: product.currency || 'EUR',
          price: product.price,
          availability: product.stock_status === 'outofstock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          shippingDetails: ['SK', 'CZ', 'HU'].map((country) => ({
            '@type': 'OfferShippingDetails',
            shippingRate: { '@type': 'MonetaryAmount', value: '3.50', currency: 'EUR' },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: country },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            },
          })),
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: ['SK', 'CZ', 'HU'],
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 14,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: t.faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  return (
    <main className="bg-[#f7fbff]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="overflow-hidden border-b border-sky-900/10 bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">{t.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="rounded-full bg-sky-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-800">
                {t.primaryCta}
              </Link>
              <Link href="/hnojivo" className="rounded-full border border-sky-700/30 bg-white px-6 py-3 text-sm font-bold text-sky-800 hover:bg-sky-50">
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-2xl shadow-sky-900/10">
            <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="relative block aspect-[4/3] bg-stone-50">
              {productImage ? (
                <Image src={productImage.src} alt={productImage.alt || product.name} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-8" />
              ) : null}
            </Link>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{t.productEyebrow}</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">{product.name}</h2>
              <p className="mt-3 leading-7 text-stone-700">{productDescription}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-500">{t.priceLabel}</p>
                  <p className="text-3xl font-black text-stone-950">{Number(product.price).toFixed(2)} €</p>
                </div>
                <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800">
                  {product.stock_status === 'outofstock' ? t.outOfStock : t.inStock}
                </span>
              </div>
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="mt-6 inline-flex w-full justify-center rounded-full bg-sky-700 px-5 py-3 text-sm font-bold text-white hover:bg-sky-800">
                {t.detailLabel}
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.useTitle}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {t.uses.map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-stone-200 bg-white p-6">
                <h3 className="font-black text-stone-950">{title}</h3>
                <p className="mt-2 leading-7 text-stone-700">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight">{t.applyTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.steps.map(([number, title, text]) => (
              <article key={number} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-black text-sky-300">{number}</p>
                <h3 className="mt-3 text-xl font-black">{title}</h3>
                <p className="mt-2 leading-7 text-stone-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.relatedTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.related.map(([href, label]) => (
            <Link
              key={href}
              href={
                href === 'npkArticle'
                  ? { pathname: '/blog/[slug]', params: { slug: npkArticleSlug[locale] || npkArticleSlug.sk } }
                  : href as AnyHref
              }
              className="rounded-3xl border border-sky-100 bg-white p-6 font-bold text-sky-800 shadow-sm hover:border-sky-300"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.faqTitle}</h2>
        <div className="mt-8 divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white">
          {t.faqs.map(([question, answer]) => (
            <article key={question} className="p-6">
              <h3 className="font-black text-stone-950">{question}</h3>
              <p className="mt-2 leading-7 text-stone-700">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
