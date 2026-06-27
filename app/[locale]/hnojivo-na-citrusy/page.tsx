import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-b-citrusy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-citrusy',
  en: '/en/citrus-fertilizer',
  hu: '/hu/citrus-mutragya',
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

const strawberryArticleSlug: Record<string, string> = {
  sk: 'kedy-hnojit-jahody',
  en: 'when-to-fertilize-strawberries',
  hu: 'mikor-tragyazzuk-az-epret',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na citrusy a exotické rastliny | GardenYX',
    metaDescription:
      'Hakofyt B citrusy je listové hnojivo na citrusy a exotické rastliny. Podporuje zelené listy, vitalitu, kvitnutie a kondíciu rastlín v interiéri aj sezónne vonku.',
    eyebrow: 'Hnojivo na citrusy',
    title: 'Hnojivo na citrusy pre zelené listy, kvitnutie a silnejšie exotické rastliny',
    intro:
      'Citrusy v kvetináči, prezimované rastliny aj exotické druhy majú iné nároky než bežné záhradné plodiny. Potrebujú stabilnú výživu, dostatok mikroprvkov a citlivý režim podľa toho, či práve rastú, kvitnú, tvoria plody alebo oddychujú počas zimy.',
    primaryCta: 'Kúpiť hnojivo na citrusy',
    secondaryCta: 'Pozrieť všetky hnojivá',
    productEyebrow: 'Odporúčaný produkt',
    productText:
      'Listové hnojivo pre citrusové a exotické rastliny s rozšírenou aminokyselinovou skladbou a vyšším obsahom železa a zinku. Vhodné pre citróny, pomaranče, mandarínky aj ďalšie vzácne rastliny.',
    priceLabel: 'Cena od',
    inStock: 'Skladom',
    outOfStock: 'Na dopyt',
    detailLabel: 'Detail produktu',
    quickTitle: 'Rýchla odpoveď: aké hnojivo na citrusy použiť?',
    quickText:
      'Na citrusy použite cielené hnojivo s dusíkom, draslíkom, železom, zinkom a ďalšími mikroprvkami. Dôležitá je pravidelnosť, mierne dávkovanie a aplikácia mimo horúčavy alebo zimného stresu. Pri citrusoch v kvetináči sledujte aj zálievku, svetlo a kvalitu substrátu.',
    useTitle: 'Kedy použiť hnojivo na citrusy',
    uses: [
      ['Na jar pri štarte rastu', 'keď citrus po zime začne tvoriť nové listy a potrebuje podporiť vitalitu bez prudkého prehnojenia.'],
      ['Pred kvitnutím a počas tvorby plodov', 'keď rastlina potrebuje stabilnú výživu, zdravé listy a dostatok mikroprvkov pre kvety a plody.'],
      ['Pri slabých alebo bledých listoch', 'keď citrus pôsobí oslabený, listy strácajú sýtu farbu alebo rastlina potrebuje jemnú doplnkovú výživu.'],
    ],
    applyTitle: 'Ako hnojiť citrusy bezpečne a účinne',
    steps: [
      ['01', 'Začnite podmienkami', 'Citrusy potrebujú svetlo, priepustný substrát a primeranú zálievku. Hnojivo funguje najlepšie vtedy, keď rastlina nie je preliata ani presušená.'],
      ['02', 'Aplikujte podľa etikety', 'Hakofyt B citrusy rieďte a aplikujte podľa odporúčaného dávkovania. Pri listovej aplikácii postrekujte ráno alebo večer.'],
      ['03', 'Prispôsobte sezóne', 'V období aktívneho rastu hnojte pravidelnejšie, počas zimovania opatrne. Nehnojte rastliny v silnom strese, horúčave alebo tesne po presadení.'],
    ],
    compareTitle: 'Citrusy v kvetináči majú špecifické potreby',
    compareText:
      'V kvetináči má rastlina obmedzený objem substrátu a živiny sa vyčerpávajú rýchlejšie než vo voľnej pôde. Preto sa oplatí pracovať s menšími, pravidelnejšími dávkami a sledovať listy. Blednutie, slabý rast alebo opad môžu súvisieť s vodou, svetlom, chladom aj výživou.',
    relatedTitle: 'Súvisiace témy',
    related: [
      ['/hnojivo', 'Hnojivo pre záhradu'],
      ['/hnojiva-hakofyt', 'Hnojivá Hakofyt'],
      ['npkArticle', 'Čo znamená NPK hnojivo'],
      ['strawberryArticle', 'Kedy hnojiť jahody'],
    ],
    faqTitle: 'Časté otázky k hnojivu na citrusy',
    faqs: [
      ['Aké hnojivo je vhodné na citrusy?', 'Vhodné je cielené hnojivo pre citrusové a exotické rastliny s makroživinami aj mikroprvkami. Hakofyt B citrusy dopĺňa najmä dusík, draslík, železo, zinok a ďalšie prvky dôležité pre listy a vitalitu.'],
      ['Kedy hnojiť citrusy?', 'Najmä počas aktívneho rastu od jari do sezóny. Pri zimovaní hnojte opatrnejšie a vždy podľa stavu rastliny, svetla a teploty.'],
      ['Prečo citrusom žltnú listy?', 'Žltnutie môže súvisieť so zálievkou, chladom, nedostatkom svetla, vyčerpaným substrátom alebo nedostatkom mikroprvkov. Pred hnojením skontrolujte aj pestovateľské podmienky.'],
      ['Môžem citrusy hnojiť listovo?', 'Áno, listová výživa môže byť praktická doplnková podpora. Aplikujte ju ráno alebo večer, nie na priamom slnku a vždy podľa etikety produktu.'],
      ['Je hnojivo na citrusy vhodné aj pre exotické rastliny?', 'Áno, Hakofyt B citrusy je určený pre citrusové a exotické rastliny vrátane vzácnejších druhov, ktoré potrebujú kvalitnú a pravidelnú výživu.'],
    ],
  },
  en: {
    metaTitle: 'Citrus fertilizer for citrus and exotic plants | GardenYX',
    metaDescription:
      'Hakofyt B Citrus is foliar fertilizer for citrus and exotic plants. It supports green leaves, vitality, flowering and plant condition indoors and outdoors.',
    eyebrow: 'Citrus fertilizer',
    title: 'Citrus fertilizer for green leaves, flowering and stronger exotic plants',
    intro:
      'Potted citrus, overwintered plants and exotic species need a different nutrition approach than common garden crops. They benefit from stable feeding, micro-elements and a seasonal routine based on growth, flowering, fruiting or winter rest.',
    primaryCta: 'Buy citrus fertilizer',
    secondaryCta: 'View all fertilizers',
    productEyebrow: 'Recommended product',
    productText:
      'Foliar fertilizer for citrus and exotic plants with an expanded amino acid composition and higher iron and zinc content. Suitable for lemons, oranges, mandarins and other rare plants.',
    priceLabel: 'Price from',
    inStock: 'In stock',
    outOfStock: 'On request',
    detailLabel: 'Product detail',
    quickTitle: 'Quick answer: what fertilizer should you use for citrus?',
    quickText:
      'Use targeted citrus fertilizer with nitrogen, potassium, iron, zinc and other micro-elements. Regular gentle feeding matters more than one strong dose. For potted citrus, also watch watering, light and substrate quality.',
    useTitle: 'When to use citrus fertilizer',
    uses: [
      ['In spring when growth starts', 'when citrus begins forming new leaves and needs vitality support without overfeeding.'],
      ['Before flowering and during fruit formation', 'when the plant needs stable nutrition, healthy leaves and micro-elements for flowers and fruit.'],
      ['With weak or pale leaves', 'when the plant looks tired, leaf color fades or it needs gentle supplemental nutrition.'],
    ],
    applyTitle: 'How to fertilize citrus safely and effectively',
    steps: [
      ['01', 'Start with conditions', 'Citrus needs light, well-drained substrate and balanced watering. Fertilizer works best when the plant is not waterlogged or completely dry.'],
      ['02', 'Follow the label', 'Dilute and apply Hakofyt B Citrus according to the recommended dosage. For foliar application, spray in the morning or evening.'],
      ['03', 'Adjust to the season', 'Feed more regularly during active growth and carefully during winter rest. Do not fertilize plants under heat, cold or transplant stress.'],
    ],
    compareTitle: 'Potted citrus has specific needs',
    compareText:
      'In a pot, the plant has limited substrate volume and nutrients are depleted faster than in open soil. Smaller regular doses and leaf observation work better than occasional strong feeding.',
    relatedTitle: 'Related topics',
    related: [
      ['/hnojivo', 'Garden fertilizer'],
      ['/hnojiva-hakofyt', 'Hakofyt fertilizers'],
      ['npkArticle', 'What NPK fertilizer means'],
      ['strawberryArticle', 'When to fertilize strawberries'],
    ],
    faqTitle: 'Citrus fertilizer FAQ',
    faqs: [
      ['What fertilizer is suitable for citrus?', 'Targeted fertilizer for citrus and exotic plants with macro-nutrients and micro-elements is suitable. Hakofyt B Citrus supplies nitrogen, potassium, iron, zinc and other elements important for leaves and vitality.'],
      ['When should I fertilize citrus?', 'Mostly during active growth from spring through the season. During winter rest, fertilize more carefully and according to plant condition, light and temperature.'],
      ['Why do citrus leaves turn yellow?', 'Yellowing can be linked to watering, cold, lack of light, exhausted substrate or missing micro-elements. Check growing conditions as well as nutrition.'],
      ['Can citrus be fertilized through leaves?', 'Yes, foliar nutrition can be a practical supplement. Apply in the morning or evening, away from direct sun, and always follow the label.'],
      ['Is citrus fertilizer suitable for exotic plants too?', 'Yes. Hakofyt B Citrus is designed for citrus and exotic plants, including rarer species that need quality regular nutrition.'],
    ],
  },
  hu: {
    metaTitle: 'Citrus műtrágya citrusokhoz és egzotikus növényekhez | GardenYX',
    metaDescription:
      'A Hakofyt B Citrus lombtrágya citrusfélékhez és egzotikus növényekhez. Támogatja a zöld leveleket, vitalitást, virágzást és kondíciót.',
    eyebrow: 'Citrus műtrágya',
    title: 'Citrus műtrágya zöld levelekhez, virágzáshoz és erősebb egzotikus növényekhez',
    intro:
      'A cserepes citrusok, teleltetett növények és egzotikus fajok más tápanyagellátást igényelnek, mint a hétköznapi kerti növények. Stabil tápanyagpótlásra, mikroelemekre és szezonhoz igazított gondozásra van szükségük.',
    primaryCta: 'Citrus műtrágya vásárlása',
    secondaryCta: 'Minden műtrágya',
    productEyebrow: 'Ajánlott termék',
    productText:
      'Lombtrágya citrusfélékhez és egzotikus növényekhez, bővített aminosav-összetétellel és magasabb vas- és cinktartalommal. Citromhoz, narancshoz, mandarinhoz és más ritka növényekhez is alkalmas.',
    priceLabel: 'Ár ettől',
    inStock: 'Raktáron',
    outOfStock: 'Rendelésre',
    detailLabel: 'Termék részletei',
    quickTitle: 'Gyors válasz: milyen műtrágya kell citrusokhoz?',
    quickText:
      'Citrusokhoz célzott, nitrogént, káliumot, vasat, cinket és más mikroelemeket tartalmazó műtrágya ajánlott. Fontosabb a rendszeres, mérsékelt tápanyagpótlás, mint egy erős adag.',
    useTitle: 'Mikor használjon citrus műtrágyát',
    uses: [
      ['Tavasszal a növekedés indulásakor', 'amikor a citrus új leveleket hoz és vitalitástámogatásra van szüksége túltrágyázás nélkül.'],
      ['Virágzás előtt és termésképzéskor', 'amikor a növény stabil tápanyagellátást, egészséges lombot és mikroelemeket igényel.'],
      ['Gyenge vagy fakó leveleknél', 'amikor a növény fáradtnak tűnik, a levelek színe halványul vagy kíméletes kiegészítő tápanyag kell.'],
    ],
    applyTitle: 'Hogyan trágyázza a citrusokat biztonságosan',
    steps: [
      ['01', 'Kezdje a körülményekkel', 'A citrusnak fény, jó vízelvezetésű közeg és kiegyensúlyozott öntözés kell. A műtrágya akkor működik jól, ha a növény nincs túlöntözve vagy kiszáradva.'],
      ['02', 'Tartsa be a címkét', 'A Hakofyt B Citrus hígítását és adagolását a termék ajánlása szerint végezze. Lombon keresztül reggel vagy este alkalmazza.'],
      ['03', 'Igazítsa a szezonhoz', 'Aktív növekedéskor rendszeresebben, teleltetéskor óvatosabban trágyázzon. Ne trágyázzon hőségben, hidegstresszben vagy közvetlenül átültetés után.'],
    ],
    compareTitle: 'A cserepes citrusoknak sajátos igényeik vannak',
    compareText:
      'Cserépben korlátozott a közeg térfogata, és a tápanyagok gyorsabban kimerülnek, mint szabad földben. Jobban működnek a kisebb, rendszeres adagok és a levelek megfigyelése.',
    relatedTitle: 'Kapcsolódó témák',
    related: [
      ['/hnojivo', 'Kerti műtrágya'],
      ['/hnojiva-hakofyt', 'Hakofyt műtrágyák'],
      ['npkArticle', 'Mit jelent az NPK'],
      ['strawberryArticle', 'Mikor trágyázzuk az epret'],
    ],
    faqTitle: 'Gyakori kérdések a citrus műtrágyáról',
    faqs: [
      ['Milyen műtrágya alkalmas citrusokhoz?', 'Célzott, makro- és mikroelemeket tartalmazó műtrágya alkalmas citrusokhoz és egzotikus növényekhez. A Hakofyt B Citrus nitrogént, káliumot, vasat, cinket és más fontos elemeket biztosít.'],
      ['Mikor trágyázzuk a citrusokat?', 'Főként aktív növekedés idején, tavasztól a szezonban. Teleltetéskor óvatosabban, a növény állapota, fény és hőmérséklet alapján.'],
      ['Miért sárgulnak a citrus levelei?', 'A sárgulás oka lehet öntözési hiba, hideg, fényhiány, kimerült közeg vagy mikroelemhiány. A tápanyag mellett a körülményeket is ellenőrizze.'],
      ['Lehet citrusokat lombon keresztül trágyázni?', 'Igen, a lombtrágya praktikus kiegészítő lehet. Reggel vagy este alkalmazza, ne közvetlen napon, és kövesse a címkét.'],
      ['Alkalmas egzotikus növényekhez is?', 'Igen. A Hakofyt B Citrus citrusfélékhez és egzotikus növényekhez készült, beleértve a ritkább fajokat is.'],
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

export default async function CitrusFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
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
        sku: product.sku || product.slug,
        mpn: product.sku || product.slug,
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
    <main className="bg-[#fffaf0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="overflow-hidden border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">{t.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700">
                {t.primaryCta}
              </Link>
              <Link href="/hnojivo" className="rounded-full border border-orange-700/30 bg-white px-6 py-3 text-sm font-bold text-orange-800 hover:bg-orange-50">
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-2xl shadow-orange-900/10">
            <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="relative block aspect-[4/3] bg-stone-50">
              {productImage ? (
                <Image src={productImage.src} alt={productImage.alt || product.name} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-8" />
              ) : null}
            </Link>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">{t.productEyebrow}</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">{product.name}</h2>
              <p className="mt-3 leading-7 text-stone-700">{productDescription}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-500">{t.priceLabel}</p>
                  <p className="text-3xl font-black text-stone-950">{Number(product.price).toFixed(2)} €</p>
                </div>
                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-800">
                  {product.stock_status === 'outofstock' ? t.outOfStock : t.inStock}
                </span>
              </div>
              <Link href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }} className="mt-6 inline-flex w-full justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700">
                {t.detailLabel}
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.quickTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-stone-700">{t.quickText}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
                <p className="text-sm font-black text-orange-300">{number}</p>
                <h3 className="mt-3 text-xl font-black">{title}</h3>
                <p className="mt-2 leading-7 text-stone-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white">
          <h2 className="text-3xl font-black tracking-tight">{t.compareTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-emerald-50/90">{t.compareText}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-stone-950">{t.relatedTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.related.map(([href, label]) => (
            <Link
              key={href}
              href={
                href === 'npkArticle'
                  ? { pathname: '/blog/[slug]', params: { slug: npkArticleSlug[locale] || npkArticleSlug.sk } }
                  : href === 'strawberryArticle'
                    ? { pathname: '/blog/[slug]', params: { slug: strawberryArticleSlug[locale] || strawberryArticleSlug.sk } }
                    : href as AnyHref
              }
              className="rounded-3xl border border-orange-100 bg-white p-6 font-bold text-orange-800 shadow-sm hover:border-orange-300"
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
