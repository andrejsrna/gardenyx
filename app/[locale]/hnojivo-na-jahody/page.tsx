import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-b-jahody';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-jahody',
  en: '/en/strawberry-fertilizer',
  hu: '/hu/eper-mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const strawberryArticleSlug: Record<string, string> = {
  sk: 'kedy-hnojit-jahody',
  en: 'when-to-fertilize-strawberries',
  hu: 'mikor-tragyazzuk-a-szamocat',
};

const npkArticleSlug: Record<string, string> = {
  sk: 'npk-hnojivo-co-znamena',
  en: 'npk-fertilizer-meaning',
  hu: 'npk-mutragya-jelentese',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na jahody pre bohaté kvitnutie a sladké plody | GardenYX',
    metaDescription:
      'Hakofyt B jahody je listové organominerálne hnojivo pre jahody. Podporuje zakorenenie, kvitnutie, sladkosť a veľkosť plodov počas celej sezóny.',
    eyebrow: 'Hnojivo na jahody',
    title: 'Hnojivo na jahody pre bohaté kvitnutie, silné rastliny a šťavnatú úrodu',
    intro:
      'Jahody potrebujú počas sezóny správne načasovanú výživu. Hakofyt B jahody je špeciálne listové hnojivo navrhnuté pre jahodníky na podporu jarného štartu, kvitnutia, nasadzovania plodov aj regenerácie po zbere úrody.',
    primaryCta: 'Kúpiť hnojivo na jahody',
    secondaryCta: 'Pozrieť všetky hnojivá',
    productEyebrow: 'Odporúčaný produkt',
    productText:
      'Špeciálne listové hnojivo pre jahody. Spája NPK živiny, stopové prvky, humínové látky a stimulátory pre bohatú úrodu a sladšie plody.',
    priceLabel: 'Cena od',
    inStock: 'Skladom',
    outOfStock: 'Na dopyt',
    detailLabel: 'Detail produktu',
    useTitle: 'Kedy použiť hnojivo na jahody',
    uses: [
      ['Na jar po prebudení', 'keď jahody začínajú rásť a potrebujú rýchlo obnoviť listovú plochu a podporiť prvé kvety.'],
      ['Pred kvitnutím a pri nasadzovaní plodov', 'keď rastlina tvorí kvety a nalieva plody, čo vyžaduje dostatok draslíka a mikroprvkov.'],
      ['Po zbere úrody', 'keď jahodníky zakladajú kvetné puky na ďalší rok a potrebujú vyživiť trsy pred zimou.'],
    ],
    applyTitle: 'Ako hnojiť jahody účinne a bezpečne',
    steps: [
      ['01', 'Dodržte riedenie podľa obalu', 'Aplikujte primeranú koncentráciu postreku priamo na listy jahôd.'],
      ['02', 'Striekajte ráno alebo večer', 'Vyhnite sa aplikácii na priamom slnku alebo počas horúčav, kedy sú listy prehriate.'],
      ['03', 'Pravidelnosť počas fázy kvitnutia', 'Listová výživa účinkuje najlepšie v 10–14 dňových intervaloch počas aktívneho rastu.'],
    ],
    relatedTitle: 'Súvisiace témy',
    related: [
      ['strawberryArticle', 'Kedy a ako hnojiť jahody'],
      ['/hnojivo-na-zeleninu', 'Hnojivo na zeleninu'],
      ['npkArticle', 'Čo znamená NPK hnojivo'],
    ],
    faqTitle: 'Časté otázky k hnojivu na jahody',
    faqs: [
      ['Aké hnojivo je najlepšie na jahody?', 'Najlepšie vyhovuje hnojivo určené priamo pre jahody s vyváženým pomerom NPK živín, mikroprvkov a humínových látok. Hakofyt B jahody podporuje nielen rast vňate, ale najmä kvitnutie a sladkosť plodov.'],
      ['Kedy hnojiť jahody počas roka?', 'Jahody hnojíme najčastejšie trikrát za sezónu: na jar pri štarte vegetácie, pred a počas kvitnutia/plodenia a na konci leta po zbere.'],
      ['Je listové hnojivo vhodné pre jahody?', 'Áno. Cez listy jahody prijímajú živiny veľmi rýchlo. Je to ideálny spôsob doplňujúcej výživy bez rizika zasolenia pôdy.'],
      ['Môžem hnojiť jahody aj počas zberu plodov?', 'Počas zberu postrek na plody neodporúčame. Listovú výživu aplikujte pred kvitnutím alebo hneď po zbere plodov.'],
    ],
  },
  en: {
    metaTitle: 'Strawberry fertilizer for rich bloom and sweet berries | GardenYX',
    metaDescription:
      'Hakofyt B Strawberries is a specialized foliar fertilizer for strawberry plants. Promotes rooting, abundant flowers, berry size and natural sweetness.',
    eyebrow: 'Strawberry fertilizer',
    title: 'Strawberry fertilizer for abundant flowering, strong plants and sweet harvest',
    intro:
      'Strawberry plants need well-timed nutrition throughout the growing season. Hakofyt B Strawberries is a dedicated foliar fertilizer engineered to support spring start, bloom, fruit set and post-harvest rejuvenation.',
    primaryCta: 'Buy strawberry fertilizer',
    secondaryCta: 'View all fertilizers',
    productEyebrow: 'Recommended product',
    productText:
      'Specialized foliar fertilizer for strawberry plants. Combines NPK nutrients, trace elements, humic substances and growth stimulators for bountiful sweet yields.',
    priceLabel: 'Price from',
    inStock: 'In stock',
    outOfStock: 'On request',
    detailLabel: 'Product detail',
    useTitle: 'When to use strawberry fertilizer',
    uses: [
      ['Early spring awake', 'when plants resume growth after winter and need to build fresh foliage and early blooms.'],
      ['Before bloom and fruit set', 'when plants demand potassium and trace elements to fill out sweet, firm berries.'],
      ['Post-harvest care', 'when strawberry beds form flower buds for next year and store energy for winter.'],
    ],
    applyTitle: 'How to apply strawberry fertilizer effectively',
    steps: [
      ['01', 'Follow label dilution', 'Mix the recommended concentration and spray directly onto strawberry leaves.'],
      ['02', 'Spray in cool hours', 'Apply early morning or late evening when leaves are cool and not exposed to harsh sun.'],
      ['03', 'Maintain regular intervals', 'Foliar feeding works best when applied every 10–14 days during active growth phases.'],
    ],
    relatedTitle: 'Related topics',
    related: [
      ['strawberryArticle', 'When and how to fertilize strawberries'],
      ['/hnojivo-na-zeleninu', 'Vegetable fertilizer'],
      ['npkArticle', 'What NPK fertilizer means'],
    ],
    faqTitle: 'Strawberry fertilizer FAQ',
    faqs: [
      ['What fertilizer is best for strawberries?', 'A specialized strawberry fertilizer containing balanced NPK, trace elements and humic acids. Hakofyt B Strawberries supports leaf health, blooming and berry sweetness.'],
      ['When should I fertilize strawberries during the year?', 'Strawberries benefit from feeding at 3 key times: early spring awakening, before/during flowering and post-harvest in late summer.'],
      ['Is foliar fertilizer good for strawberries?', 'Yes. Foliar application delivers nutrients quickly through the leaves without over-salting the soil.'],
      ['Can I spray fertilizer during harvest?', 'We do not recommend spraying directly onto ripening berries. Apply foliar fertilizer before bloom or right after harvesting.'],
    ],
  },
  hu: {
    metaTitle: 'Szamóca és eper műtrágya a bő virágzásért és édes termésért | GardenYX',
    metaDescription:
      'A Hakofyt B szamóca egy speciális lombtrágya eperhez és szamócához. Támogatja a gyökeresedést, virágzást, a termés méretét és édességét.',
    eyebrow: 'Eper műtrágya',
    title: 'Eper műtrágya a bőséges virágzásért, erős növényekért és édes termésért',
    intro:
      'Az eper és szamóca időszerű tápanyag-utánpótlást igényel a szezon során. A Hakofyt B szamóca egy célzott lombtrágya, amelyet a tavaszi indulás, a virágzás, a terméskötődés és a szüret utáni megújulás támogatására fejlesztettek ki.',
    primaryCta: 'Eper műtrágya vásárlása',
    secondaryCta: 'Minden műtrágya',
    productEyebrow: 'Ajánlott termék',
    productText:
      'Speciális lombtrágya eperhez és szamócához. NPK tápanyagokat, nyomelemeket, huminsavakat és növekedésserkentőket tartalmaz a gazdag és édes termésért.',
    priceLabel: 'Ár ettől',
    inStock: 'Raktáron',
    outOfStock: 'Rendelésre',
    detailLabel: 'Termék részletei',
    useTitle: 'Mikor használjunk eper műtrágyát',
    uses: [
      ['Kora tavaszi induláskor', 'amikor a növények áttelelés után új lombot és első virágokat növesztenek.'],
      ['Virágzás előtt és terméskötődéskor', 'amikor a növény káliumot és nyomelemeket igényel az édes, formás gyümölcsökhöz.'],
      ['Szüret utáni gondozáskor', 'amikor az eper a következő évi virágrügyeket alapozza meg tél előtt.'],
    ],
    applyTitle: 'Hogyan alkalmazzuk az eper lombtrágyát',
    steps: [
      ['01', 'Kövassa a címke adagolását', 'Keverje el az ajánlott töménységű oldatot és permetezze a levelekre.'],
      ['02', 'Reggel vagy este permetezzen', 'Kerülje a tűző napon vagy hőségben történő munkát.'],
      ['03', 'Rendszeres időközök', 'A lombtrágyázás 10–14 napos időközönként a leghatékonyabb az aktív szakaszban.'],
    ],
    relatedTitle: 'Kapcsolódó témák',
    related: [
      ['strawberryArticle', 'Mikor és hogyan trágyázzuk a szamócát'],
      ['/hnojivo-na-zeleninu', 'Zöldség műtrágya'],
      ['npkArticle', 'Mit jelent az NPK műtrágya'],
    ],
    faqTitle: 'Gyakori kérdések az eper trágyázásáról',
    faqs: [
      ['Milyen műtrágya a legjobb eperhez?', 'A kifejezetten szamócához készült kiegyensúlyozott NPK és mikroelemes műtrágya. A Hakofyt B szamóca az édes és ízletes termést támogatja.'],
      ['Mikor trágyázzuk az epret az év során?', 'Tavasszal a vegetáció kezdetén, virágzás előtt/alatt, valamint a szüret utáni időszakban.'],
      ['Alkalmas a lombtrágya az eperhez?', 'Igen, a leveleken keresztül a tápanyagok gyorsan felszívódnak anélkül, hogy túlsóznák a talajt.'],
      ['Szüret közben is lehet permetezni?', 'Érő gyümölcsre közvetlenül nem ajánlott permetezni. A tápanyagpótlást virágzás előtt vagy a szüret befejeztével végezze.'],
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

export default async function StrawberryFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getCopy(locale);
  const product = await getProductBySlug(PRODUCT_SLUG, locale);

  if (!product) {
    notFound();
  }

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
      },
      {
        '@type': 'Product',
        '@id': productUrl,
        url: productUrl,
        name: product.name,
        description: productDescription,
        ...(productImage ? { image: productImage.src } : {}),
        sku: product.sku || product.slug,
        brand: {
          '@type': 'Brand',
          name: 'Hakofyt',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: product.currency || 'EUR',
          price: Number(product.price).toFixed(2),
          availability: product.stock_status === 'outofstock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: t.faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  return (
    <main className="bg-[#fbfcf7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">{t.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800">
                {t.primaryCta}
              </Link>
              <Link href="/hnojivo" className="rounded-full border border-emerald-700/30 bg-white px-6 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50">
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-900/10">
            <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="relative block aspect-[4/3] bg-stone-50">
              {productImage ? (
                <Image src={productImage.src} alt={productImage.alt || product.name} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-8" />
              ) : null}
            </Link>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.productEyebrow}</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">{product.name}</h2>
              <p className="mt-3 leading-7 text-stone-700">{productDescription}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-500">{t.priceLabel}</p>
                  <p className="text-3xl font-black text-stone-950">{Number(product.price).toFixed(2)} €</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                  {product.stock_status === 'outofstock' ? t.outOfStock : t.inStock}
                </span>
              </div>
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="mt-6 inline-flex w-full justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">
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
                <p className="text-sm font-black text-lime-300">{number}</p>
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
                href === 'strawberryArticle'
                  ? { pathname: '/blog/[slug]', params: { slug: strawberryArticleSlug[locale] || strawberryArticleSlug.sk } }
                  : href === 'npkArticle'
                    ? { pathname: '/blog/[slug]', params: { slug: npkArticleSlug[locale] || npkArticleSlug.sk } }
                    : href as AnyHref
              }
              className="rounded-3xl border border-emerald-100 bg-white p-6 font-bold text-emerald-800 shadow-sm hover:border-emerald-300"
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
            <details key={question} className="group p-6">
              <summary className="flex cursor-pointer items-center justify-between text-lg font-bold text-stone-950">
                <span>{question}</span>
                <span className="ml-4 text-emerald-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-7 text-stone-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
