import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-b-kvety';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-kvety',
  en: '/en/flower-fertilizer',
  hu: '/hu/virag-mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na kvety: balkónové rastliny, hortenzie a záhony | GardenYX',
    metaDescription:
      'Hakofyt B kvety je listové hnojivo na kvitnúce rastliny so zvýšeným obsahom bóru, draslíka a fosforu pre intenzívnejšie kvitnutie.',
    eyebrow: 'Hnojivo na kvety',
    title: 'Hnojivo na kvety pre bohatšie kvitnutie, väčšie kvety a intenzívnejšie farby',
    intro:
      'Kvitnúce rastliny potrebujú počas sezóny cielenejšiu výživu než univerzálne hnojivo. Hakofyt B kvety má zvýšený obsah fosforu, draslíka a bóru, ktoré podporujú nasadzovanie kvetov, veľkosť kvetov a intenzitu farieb.',
    primaryCta: 'Kúpiť hnojivo na kvety',
    secondaryCta: 'Pozrieť všetky hnojivá',
    productEyebrow: 'Odporúčaný produkt',
    productText:
      'Listové hnojivo pre všetky kvitnúce rastliny. Vhodné pre balkónové kvety, záhony, okrasné rastliny, hortenzie, levandule a ďalšie kvitnúce druhy.',
    priceLabel: 'Cena od',
    inStock: 'Skladom',
    outOfStock: 'Na dopyt',
    detailLabel: 'Detail produktu',
    useTitle: 'Pre ktoré kvety je vhodné',
    uses: [
      ['Balkónové kvety', 'muškáty, petúnie a sezónne kvety počas pravidelného kvitnutia.'],
      ['Záhonové rastliny', 'kvitnúce rastliny v okrasných záhonoch počas vegetačného obdobia.'],
      ['Hortenzie a levandule', 'okrasné druhy, pri ktorých rozhoduje vitalita, farba a nasadzovanie kvetov.'],
    ],
    applyTitle: 'Ako hnojiť kvety počas sezóny',
    steps: [
      ['01', 'Rieďte podľa návodu', 'Pri Hakofyt B kvety dodržte odporúčané riedenie a dávkovanie z etikety.'],
      ['02', 'Aplikujte pravidelne', 'Počas vegetačného obdobia aplikujte v intervaloch podľa návodu, typicky každých 10 až 14 dní.'],
      ['03', 'Vyhnite sa stresu', 'Nehnojte počas extrémnych horúčav, na priamom slnku alebo pri výrazne preschnutých rastlinách.'],
    ],
    relatedTitle: 'Súvisiace témy',
    related: [
      ['/hnojivo', 'Hnojivo pre záhradu'],
      ['/organicke-hnojivo', 'Organické hnojivo'],
      ['/npk-hnojivo', 'Čo znamená NPK hnojivo'],
    ],
    faqTitle: 'Časté otázky k hnojivu na kvety',
    faqs: [
      ['Aké hnojivo je vhodné na kvety?', 'Na kvitnúce rastliny je vhodné hnojivo so zameraním na fosfor, draslík a bór. Hakofyt B kvety je určený práve pre podporu kvitnutia.'],
      ['Ako často hnojiť kvety?', 'Počas vegetačného obdobia sa Hakofyt B kvety aplikuje podľa návodu, typicky každých 10 až 14 dní.'],
      ['Je vhodné aj na balkónové kvety?', 'Áno, je vhodné pre balkónové aj záhonové kvitnúce rastliny.'],
      ['Môžem ho použiť na hortenzie?', 'Áno, pri hortenziách pomáha cieliť na vitalitu a kvitnutie. Pri kyslomilných druhoch však sledujte aj pH substrátu.'],
    ],
  },
  en: {
    metaTitle: 'Flower fertilizer for balcony plants, hydrangeas and beds | GardenYX',
    metaDescription:
      'Hakofyt B Flowers is foliar fertilizer for flowering plants with increased boron, potassium and phosphorus for more intense blooming.',
    eyebrow: 'Flower fertilizer',
    title: 'Flower fertilizer for richer blooming, larger flowers and stronger colors',
    intro:
      'Flowering plants need more targeted nutrition than universal fertilizer. Hakofyt B Flowers has increased phosphorus, potassium and boron to support flower setting, flower size and color intensity.',
    primaryCta: 'Buy flower fertilizer',
    secondaryCta: 'View all fertilizers',
    productEyebrow: 'Recommended product',
    productText:
      'Foliar fertilizer for flowering plants. Suitable for balcony flowers, flower beds, ornamental plants, hydrangeas, lavender and other flowering species.',
    priceLabel: 'Price from',
    inStock: 'In stock',
    outOfStock: 'On request',
    detailLabel: 'Product detail',
    useTitle: 'Which flowers it suits',
    uses: [
      ['Balcony flowers', 'geraniums, petunias and seasonal flowers during regular blooming.'],
      ['Flower beds', 'flowering ornamental plants during the vegetation period.'],
      ['Hydrangeas and lavender', 'ornamental species where vitality, color and flower setting matter.'],
    ],
    applyTitle: 'How to fertilize flowers during the season',
    steps: [
      ['01', 'Dilute according to the label', 'Follow the recommended dilution and dosing on the label.'],
      ['02', 'Apply regularly', 'During vegetation, apply in label intervals, typically every 10 to 14 days.'],
      ['03', 'Avoid stress', 'Do not fertilize in extreme heat, direct sun or when plants are very dry.'],
    ],
    relatedTitle: 'Related topics',
    related: [
      ['/hnojivo', 'Garden fertilizer'],
      ['/organicke-hnojivo', 'Organic fertilizer'],
      ['/npk-hnojivo', 'What NPK fertilizer means'],
    ],
    faqTitle: 'Flower fertilizer FAQ',
    faqs: [
      ['What fertilizer is suitable for flowers?', 'Flowering plants benefit from fertilizer focused on phosphorus, potassium and boron. Hakofyt B Flowers is made for blooming support.'],
      ['How often should I fertilize flowers?', 'During vegetation, apply according to the label, typically every 10 to 14 days.'],
      ['Is it suitable for balcony flowers?', 'Yes, it is suitable for balcony and flower bed plants.'],
      ['Can I use it for hydrangeas?', 'Yes, it supports vitality and blooming. For acid-loving plants, also monitor substrate pH.'],
    ],
  },
  hu: {
    metaTitle: 'Virág műtrágya balkon növényekhez, hortenziához és ágyásokhoz | GardenYX',
    metaDescription:
      'A Hakofyt B Virágok lombtrágya virágzó növényekhez, magasabb bór-, kálium- és foszfortartalommal az intenzívebb virágzásért.',
    eyebrow: 'Virág műtrágya',
    title: 'Virág műtrágya gazdagabb virágzáshoz, nagyobb virágokhoz és erősebb színekhez',
    intro:
      'A virágzó növények célzottabb tápanyagellátást igényelnek, mint egy univerzális műtrágya. A Hakofyt B Virágok foszfort, káliumot és bórt tartalmaz nagyobb arányban a virágképzés támogatására.',
    primaryCta: 'Virág műtrágya vásárlása',
    secondaryCta: 'Minden műtrágya',
    productEyebrow: 'Ajánlott termék',
    productText:
      'Lombtrágya virágzó növényekhez. Alkalmas balkonvirágokhoz, ágyásokhoz, dísznövényekhez, hortenziához, levendulához és más virágzó fajokhoz.',
    priceLabel: 'Ár ettől',
    inStock: 'Raktáron',
    outOfStock: 'Rendelésre',
    detailLabel: 'Termék részletei',
    useTitle: 'Mely virágokhoz alkalmas',
    uses: [
      ['Balkonvirágok', 'muskátli, petúnia és szezonális virágok rendszeres virágzáskor.'],
      ['Ágyásnövények', 'virágzó dísznövények a vegetációs időszakban.'],
      ['Hortenzia és levendula', 'dísznövények, ahol fontos a vitalitás, szín és virágképzés.'],
    ],
    applyTitle: 'Hogyan trágyázza a virágokat szezon közben',
    steps: [
      ['01', 'Hígítsa a címke szerint', 'Tartsa be az ajánlott hígítást és adagolást.'],
      ['02', 'Alkalmazza rendszeresen', 'Vegetációs időszakban a címke szerinti időközönként, jellemzően 10-14 naponta.'],
      ['03', 'Kerülje a stresszt', 'Ne trágyázzon hőségben, közvetlen napon vagy nagyon száraz növényeken.'],
    ],
    relatedTitle: 'Kapcsolódó témák',
    related: [
      ['/hnojivo', 'Kerti műtrágya'],
      ['/organicke-hnojivo', 'Szerves műtrágya'],
      ['/npk-hnojivo', 'Mit jelent az NPK'],
    ],
    faqTitle: 'Gyakori kérdések virág műtrágyához',
    faqs: [
      ['Milyen műtrágya alkalmas virágokhoz?', 'Virágzó növényekhez foszforra, káliumra és bórra fókuszáló műtrágya ajánlott.'],
      ['Milyen gyakran trágyázzuk a virágokat?', 'Vegetációs időszakban a címke szerint, jellemzően 10-14 naponta.'],
      ['Alkalmas balkonvirágokhoz?', 'Igen, balkonvirágokhoz és ágyásnövényekhez is alkalmas.'],
      ['Használható hortenziához?', 'Igen, támogatja a vitalitást és virágzást. Savanyú talajt kedvelő növényeknél figyelje a pH-t is.'],
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

export default async function FlowerFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
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
        image: productImage ? `${siteUrl}${productImage.src}` : undefined,
        sku: product.sku || undefined,
        brand: { '@type': 'Brand', name: 'Hakofyt' },
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
        mainEntity: t.faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  return (
    <main className="bg-[#fffaf2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="overflow-hidden border-b border-amber-900/10 bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-700">{t.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="rounded-full bg-amber-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-800">
                {t.primaryCta}
              </Link>
              <Link href="/hnojivo" className="rounded-full border border-amber-700/30 bg-white px-6 py-3 text-sm font-bold text-amber-800 hover:bg-amber-50">
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-2xl shadow-amber-900/10">
            <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="relative block aspect-[4/3] bg-stone-50">
              {productImage ? (
                <Image src={productImage.src} alt={productImage.alt || product.name} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-8" />
              ) : null}
            </Link>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.productEyebrow}</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">{product.name}</h2>
              <p className="mt-3 leading-7 text-stone-700">{productDescription}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-500">{t.priceLabel}</p>
                  <p className="text-3xl font-black text-stone-950">{Number(product.price).toFixed(2)} €</p>
                </div>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
                  {product.stock_status === 'outofstock' ? t.outOfStock : t.inStock}
                </span>
              </div>
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="mt-6 inline-flex w-full justify-center rounded-full bg-amber-700 px-5 py-3 text-sm font-bold text-white hover:bg-amber-800">
                {t.detailLabel}
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.useTitle}</h2>
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
                <p className="text-sm font-black text-amber-300">{number}</p>
                <h3 className="mt-3 text-xl font-black">{title}</h3>
                <p className="mt-2 leading-7 text-stone-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.relatedTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.related.map(([href, label]) => (
            <Link key={href} href={href as AnyHref} className="rounded-3xl border border-amber-100 bg-white p-6 font-bold text-amber-800 shadow-sm hover:border-amber-300">
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
