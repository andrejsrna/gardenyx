import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-plus-na-ovocne-dreviny';

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-ovocne-stromy',
  en: '/en/fruit-tree-fertilizer',
  hu: '/hu/gyumolcsfa-tragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na ovocné stromy Hakofyt Plus | GardenYX',
    metaDescription:
      'Hľadáte hnojivo na ovocné stromy? Hakofyt Plus na ovocné dreviny podporuje bohatú úrodu, zdravý rast výhonov a vysokú kvalitu ovocia.',
    eyebrow: 'Hnojivo na ovocné stromy',
    title: 'Bohatá úroda začína správnou výživou ovocných stromov',
    intro:
      'Hakofyt Plus na ovocné dreviny je listové hnojivo špeciálne zložené pre jablone, hrušky, čerešne, slivky a ďalšie ovocné stromy. Kombinácia dusíka, fosforu, draslíka a prírodných stimulátorov rastu podporuje zdravý rast výhonov, intenzívne kvitnutie a kvalitné plody.',
    primaryCta: 'Pozrieť Hakofyt Plus ovocné dreviny',
    secondaryCta: 'Prečo listové hnojivo?',
    benefits: [
      ['Bohatá úroda', 'viac a kvalitnejšie ovocie'],
      ['Zdravý rast výhonov', 'silné a odolné vetvičky'],
      ['Listová výživa', 'rýchle vstrebávanie živín'],
      ['Prírodné stimulátory', 'aminokyseliny a humínové kyseliny'],
    ],
    productEyebrow: 'Odporúčaný produkt',
    productTitle: 'Hakofyt Plus na ovocné dreviny',
    productText:
      'Listové hnojivo pre ovocné stromy s dusíkom, fosforom, draslíkom, mikroprvkami, humínovými kyselinami a aminokyselinami. Podporuje zdravý rast, kvitnutie a bohatú úrodu.',
    priceLabel: 'Cena',
    outOfStock: 'Na dopyt',
    inStock: 'Skladom',
    detailLabel: 'Detail produktu',
    buyLabel: 'Kúpiť produkt',
    reasonsTitle: 'Kedy hnojiť ovocné stromy',
    reasons: [
      ['Na jar pred kvitnutím', 'Prvé jarné hnojenie pred rozkvitnutím stromov dodá energiu pre bohaté kvitnutie a tvorbu plodov. Ideálne aplikovať, keď sa pôda dostatočne prehreje.'],
      ['Po odkvitnutí', 'Po opadnutí kvetov začína intenzívny rast plodov. Hnojivo v tejto fáze zaisťuje dostatok živín pre správny vývoj a veľkosť ovocia.'],
      ['Počas leta', 'Pravidelná výživa počas sezóny udržiava stromy v kondícii, podporuje tvorbu ovocných pukov na budúci rok a zvyšuje odolnosť voči suchu a chorobám.'],
    ],
    methodTitle: 'Ako hnojiť ovocné stromy krok za krokom',
    methodText:
      'Listové hnojenie je jednoduché a efektívne. Živiny sa vstrebávajú priamo cez listy, čo zaručuje rýchlejší účinok ako granulované hnojivá aplikované do pôdy.',
    steps: [
      { number: '01', title: 'Rozrieďte hnojivo', description: 'Pripravte roztok Hakofyt Plus na ovocné dreviny podľa návodu na etikete. Postačuje bežný záhradný postrekovač.' },
      { number: '02', title: 'Postrekujte listy', description: 'Aplikujte rovnomerne na celú listovú plochu stromov, ideálne ráno alebo večer mimo priameho slnka a pri teplote pod 25 °C.' },
      { number: '03', title: 'Opakujte v sezóne', description: 'Pre najlepšie výsledky opakujte aplikáciu každé 2 – 3 týždne od jari do konca leta. Pravidelnosť rozhoduje o výsledku.' },
    ],
    faqTitle: 'Časté otázky k hnojivu na ovocné stromy',
    faqs: [
      {
        question: 'Kedy je najlepší čas hnojiť ovocné stromy?',
        answer:
          'Prvá aplikácia patrí na jar tesne pred kvitnutím alebo pri rozvinutí listov. Hnojenie pokračuje každé 2–3 týždne počas celej vegetačnej sezóny. Posledná aplikácia by mala byť najneskôr 4 týždne pred zberom.',
      },
      {
        question: 'Je Hakofyt Plus vhodný pre všetky ovocné stromy?',
        answer:
          'Áno. Hakofyt Plus na ovocné dreviny je určený pre jablone, hrušky, čerešne, slivky, marhule, broskyne aj ďalšie ovocné dreviny. Obsahuje vyvážený pomer živín pre väčšinu druhov ovocných stromov.',
      },
      {
        question: 'Prečo zvoliť listové hnojivo namiesto granulovaného?',
        answer:
          'Listové hnojivo sa vstrebáva priamo cez listy – pôsobí rýchlejšie a efektívnejšie, najmä v obdobiach sucha alebo pri nevhodnom pH pôdy, keď koreňové hnojenie nemusí fungovať optimálne.',
      },
      {
        question: 'Zvyšuje hnojivo kvalitu ovocia?',
        answer:
          'Áno. Správna výživa ovocných stromov počas sezóny priamo ovplyvňuje veľkosť, farbu, chuť a trvanlivosť plodov. Aminokyseliny a prírodné stimulátory v Hakofyt Plus podporujú tvorbu plodov a zlepšujú ich celkovú kvalitu.',
      },
    ],
    ctaTitle: 'Doprajte svojim ovocným stromom to najlepšie',
    ctaText: 'Hakofyt Plus na ovocné dreviny je dostupný skladom. Objednajte ešte dnes a tešte sa na bohatú úrodu túto sezónu.',
    ctaBuy: 'Objednať Hakofyt Plus ovocné dreviny',
    ctaDetail: 'Zobraziť detail produktu',
    readAlsoLabel: 'Prečítajte si tiež',
    readAlsoLink: 'Čítať článok',
    readAlsoSlug: 'hakofyt-hnojiva-na-rastliny',
    readAlsoTitle: 'Hakofyt hnojivá na rastliny',
    readAlsoExcerpt: 'Objavte celý rad hnojív Hakofyt – pre zeleninu, ovocné dreviny, kvety, trávnik aj špeciálne kultúry. Zistite, ktorý produkt je pre vaše rastliny ten pravý.',
    readAlsoReadTime: '4 min čítania',
  },
  en: {
    metaTitle: 'Fruit tree fertilizer Hakofyt Plus | GardenYX',
    metaDescription:
      'Looking for a fruit tree fertilizer? Hakofyt Plus for fruit trees supports abundant harvests, healthy shoot growth and high fruit quality.',
    eyebrow: 'Fruit tree fertilizer',
    title: 'An abundant harvest starts with the right nutrition for fruit trees',
    intro:
      'Hakofyt Plus for fruit trees is a foliar fertilizer specially formulated for apple, pear, cherry, plum and other fruit trees. The combination of nitrogen, phosphorus, potassium and natural growth stimulators supports healthy shoot growth, intense flowering and quality fruit.',
    primaryCta: 'View Hakofyt Plus Fruit Trees',
    secondaryCta: 'Why foliar fertilizer?',
    benefits: [
      ['Abundant harvest', 'more and better-quality fruit'],
      ['Healthy shoot growth', 'strong and resilient branches'],
      ['Foliar nutrition', 'fast nutrient absorption'],
      ['Natural stimulators', 'amino acids and humic acids'],
    ],
    productEyebrow: 'Recommended product',
    productTitle: 'Hakofyt Plus Fruit Trees',
    productText:
      'Foliar fertilizer for fruit trees with nitrogen, phosphorus, potassium, micro-elements, humic acids and amino acids. Supports healthy growth, flowering and abundant harvests.',
    priceLabel: 'Price',
    outOfStock: 'On request',
    inStock: 'In stock',
    detailLabel: 'Product detail',
    buyLabel: 'Buy product',
    reasonsTitle: 'When to fertilize fruit trees',
    reasons: [
      ['In spring before flowering', 'The first spring fertilization before the trees bloom provides energy for abundant flowering and fruit set. Apply once the soil has warmed sufficiently.'],
      ['After flowering', 'Once the blossoms fall, intensive fruit development begins. Fertilizing at this stage ensures enough nutrients for proper fruit size and development.'],
      ['During summer', 'Regular feeding throughout the season keeps trees in condition, promotes fruit bud formation for next year and increases resistance to drought and disease.'],
    ],
    methodTitle: 'How to fertilize fruit trees step by step',
    methodText:
      'Foliar fertilization is simple and effective. Nutrients are absorbed directly through the leaves, ensuring faster action than soil-applied granular fertilizers.',
    steps: [
      { number: '01', title: 'Dilute the fertilizer', description: 'Prepare the Hakofyt Plus Fruit Trees solution according to the label instructions. A standard garden sprayer is all you need.' },
      { number: '02', title: 'Spray the leaves', description: 'Apply evenly over the entire leaf surface of the trees, ideally in the morning or evening, away from direct sunlight and below 25 °C.' },
      { number: '03', title: 'Repeat during the season', description: 'For best results, repeat every 2–3 weeks from spring to late summer. Consistency determines the outcome.' },
    ],
    faqTitle: 'Fruit tree fertilizer FAQ',
    faqs: [
      {
        question: 'When is the best time to fertilize fruit trees?',
        answer:
          'The first application belongs in spring, just before flowering or as leaves unfurl. Continue every 2–3 weeks throughout the growing season. The last application should be at least 4 weeks before harvest.',
      },
      {
        question: 'Is Hakofyt Plus suitable for all fruit trees?',
        answer:
          'Yes. Hakofyt Plus for fruit trees is intended for apple, pear, cherry, plum, apricot, peach and other fruit trees. It contains a balanced ratio of nutrients suitable for most fruit tree species.',
      },
      {
        question: 'Why choose foliar fertilizer over granular?',
        answer:
          'Foliar fertilizer is absorbed directly through the leaves – it acts faster and more efficiently, especially during dry spells or when soil pH is unsuitable and root uptake may be suboptimal.',
      },
      {
        question: 'Does fertilizing improve fruit quality?',
        answer:
          'Yes. Proper nutrition of fruit trees during the season directly affects the size, color, taste and shelf life of the fruit. Amino acids and natural stimulators in Hakofyt Plus support fruit set and improve overall quality.',
      },
    ],
    ctaTitle: 'Give your fruit trees the best care',
    ctaText: 'Hakofyt Plus Fruit Trees is available in stock. Order today and look forward to an abundant harvest this season.',
    ctaBuy: 'Order Hakofyt Plus Fruit Trees',
    ctaDetail: 'View product detail',
    readAlsoLabel: 'Read also',
    readAlsoLink: 'Read article',
    readAlsoSlug: 'hakofyt-hnojiva-na-rastliny',
    readAlsoTitle: 'Hakofyt fertilizers for plants',
    readAlsoExcerpt: 'Discover the full Hakofyt fertilizer range – for vegetables, fruit trees, flowers, lawns and specialty crops. Find out which product is right for your plants.',
    readAlsoReadTime: '4 min read',
  },
  hu: {
    metaTitle: 'Gyümölcsfa trágya Hakofyt Plus | GardenYX',
    metaDescription:
      'Gyümölcsfa trágyát keres? A Hakofyt Plus gyümölcsfákhoz bőséges termést, egészséges hajtásnövekedést és magas gyümölcsminőséget támogat.',
    eyebrow: 'Gyümölcsfa trágya',
    title: 'A bőséges termés a gyümölcsfák megfelelő táplálásával kezdődik',
    intro:
      'A Hakofyt Plus gyümölcsfákhoz lombtrágya kifejezetten almafákhoz, körtékhez, cseresznyékhez, szilvákhoz és más gyümölcsfákhoz lett kifejlesztve. A nitrogén, foszfor, kálium és természetes növekedésserkentők kombinációja egészséges hajtásnövekedést, intenzív virágzást és minőségi gyümölcsöket biztosít.',
    primaryCta: 'Hakofyt Plus gyümölcsfák megtekintése',
    secondaryCta: 'Miért lombtrágya?',
    benefits: [
      ['Bőséges termés', 'több és jobb minőségű gyümölcs'],
      ['Egészséges hajtásnövekedés', 'erős és ellenálló ágak'],
      ['Lombtrágya', 'gyors tápanyag-felszívódás'],
      ['Természetes serkentők', 'aminosavak és huminsavak'],
    ],
    productEyebrow: 'Ajánlott termék',
    productTitle: 'Hakofyt Plus gyümölcsfák',
    productText:
      'Gyümölcsfák lombtrágyája nitrogénnel, foszforral, káliummal, mikroelemekkel, huminsavakkal és aminosavakkal. Támogatja az egészséges növekedést, virágzást és bőséges termést.',
    priceLabel: 'Ár',
    outOfStock: 'Rendelésre',
    inStock: 'Raktáron',
    detailLabel: 'Termék részletei',
    buyLabel: 'Termék vásárlása',
    reasonsTitle: 'Mikor trágyázzuk a gyümölcsfákat',
    reasons: [
      ['Tavasszal virágzás előtt', 'Az első tavaszi trágyázás a fák virágzása előtt energiát biztosít a bőséges virágzáshoz és gyümölcskötéshez. Akkor alkalmazza, ha a talaj már kellően felmelegedett.'],
      ['Virágzás után', 'Miután a virágok lehullanak, megkezdődik az intenzív gyümölcsfejlődés. Az ebben a fázisban végzett trágyázás elegendő tápanyagot biztosít a gyümölcsök méretéhez és fejlődéséhez.'],
      ['Nyár folyamán', 'A rendszeres táplálás a szezon során kondícióban tartja a fákat, elősegíti a jövő évi gyümölcsrügyek képzését és növeli az aszállyal és betegségekkel szembeni ellenálló képességet.'],
    ],
    methodTitle: 'A gyümölcsfa trágyázás lépésről lépésre',
    methodText:
      'A lombpermetezés egyszerű és hatékony. A tápanyagok közvetlenül a leveleken keresztül szívódnak fel, ami gyorsabb hatást biztosít, mint a talajba juttatott szemcsés trágyák.',
    steps: [
      { number: '01', title: 'Hígítsa fel a trágyát', description: 'Készítse el a Hakofyt Plus gyümölcsfák oldatát a cimkén szereplő utasítások szerint. Egy egyszerű kerti permetező elegendő.' },
      { number: '02', title: 'Permetezze a leveleket', description: 'Egyenletesen vigye fel a fák teljes levélfelületére, lehetőleg reggel vagy este, közvetlen napfény nélkül és 25 °C alatti hőmérsékleten.' },
      { number: '03', title: 'Ismételje a szezonban', description: 'A legjobb eredményért ismételje meg minden 2–3 hétben tavasszal a nyár végéig. A rendszeresség dönti el az eredményt.' },
    ],
    faqTitle: 'Gyakori kérdések a gyümölcsfa trágyáról',
    faqs: [
      {
        question: 'Mikor a legjobb a gyümölcsfákat trágyázni?',
        answer:
          'Az első alkalmazás tavasszal, közvetlenül virágzás előtt vagy a levelek kibontakozásakor esedékes. Folytassa 2–3 hetente az egész vegetációs időszakban. Az utolsó alkalmazásnak legalább 4 héttel a szüret előtt kell lennie.',
      },
      {
        question: 'A Hakofyt Plus minden gyümölcsfához megfelelő?',
        answer:
          'Igen. A Hakofyt Plus gyümölcsfákhoz almafákhoz, körtékhez, cseresznyékhez, szilvákhoz, kajszikhoz, őszibarackokhoz és más gyümölcsfákhoz is alkalmas. Kiegyensúlyozott tápanyagarányt tartalmaz a legtöbb gyümölcsfa-fajhoz.',
      },
      {
        question: 'Miért válasszuk a lombtrágyát a szemcsés helyett?',
        answer:
          'A lombtrágya közvetlenül a leveleken keresztül szívódik fel – gyorsabban és hatékonyabban hat, különösen száraz időszakokban vagy kedvezőtlen talaj-pH esetén, amikor a gyökérfelvétel nem optimális.',
      },
      {
        question: 'Javítja-e a trágyázás a gyümölcsök minőségét?',
        answer:
          'Igen. A gyümölcsfák megfelelő táplálása a szezon során közvetlenül befolyásolja a gyümölcsök méretét, színét, ízét és eltarthatóságát. A Hakofyt Plus aminosavai és természetes serkentői támogatják a gyümölcskötést és javítják az általános minőséget.',
      },
    ],
    ctaTitle: 'Adja meg gyümölcsfáinak a legjobb gondozást',
    ctaText: 'A Hakofyt Plus gyümölcsfák raktáron elérhető. Rendelje meg még ma, és örüljön a bőséges termésnek ebben a szezonban.',
    ctaBuy: 'Hakofyt Plus gyümölcsfák rendelése',
    ctaDetail: 'Termék részleteinek megtekintése',
    readAlsoLabel: 'Olvassa el',
    readAlsoLink: 'Cikk olvasása',
    readAlsoSlug: 'hakofyt-hnojiva-na-rastliny',
    readAlsoTitle: 'Hakofyt műtrágyák növényekhez',
    readAlsoExcerpt: 'Fedezze fel a teljes Hakofyt műtrágya-kínálatot – zöldségekhez, gyümölcsfákhoz, virágokhoz, gyephez és speciális kultúrákhoz. Tudja meg, melyik termék a legjobb növényeihez.',
    readAlsoReadTime: '4 perc olvasás',
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

export default async function FruitTreeFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
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
        about: { '@type': 'Thing', name: t.eyebrow },
        mainEntity: { '@id': `${productUrl}#product` },
      },
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: productDescription,
        image: productImage?.src,
        sku: product.sku || undefined,
        brand: { '@type': 'Brand', name: 'Hakofyt' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: product.currency || 'EUR',
          price: product.price,
          availability:
            product.stock_status === 'outofstock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
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
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: t.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
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
                href="/hnojiva-hakofyt"
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
            <article className="grid w-full overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-stone-200/80 md:grid-cols-[0.9fr_1.1fr]">
              <Link
                href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
                className="relative min-h-72 bg-stone-50 p-4"
              >
                {productImage ? (
                  <Image
                    src={productImage.src}
                    alt={productImage.alt || product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-contain p-4"
                  />
                ) : null}
              </Link>
              <div className="flex flex-col p-7 sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {product.categories[0]?.name || 'Hakofyt'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-950">{product.name}</h2>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-500">{t.priceLabel}</p>
                    <p className="mt-1 text-3xl font-bold text-stone-950">{Number(product.price).toFixed(2)} €</p>
                  </div>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      product.stock_status === 'outofstock'
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
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
              <article
                key={title}
                className="group relative rounded-2xl bg-[#f8f8f3] p-7 ring-1 ring-emerald-100 transition hover:ring-emerald-300"
              >
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

      {/* Read also */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{t.readAlsoLabel}</p>
          <Link
            href="/hnojiva-hakofyt"
            className="mt-6 grid overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md sm:grid-cols-[auto_1fr]"
          >
            <div className="flex items-center justify-center bg-emerald-50 px-10 py-8 sm:px-12">
              <svg
                className="h-14 w-14 text-emerald-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Hakofyt</span>
              <h3 className="mt-2 text-2xl font-bold text-stone-950 sm:text-3xl">{t.readAlsoTitle}</h3>
              <p className="mt-3 text-base leading-7 text-stone-600">{t.readAlsoExcerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                {t.readAlsoLink}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
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
