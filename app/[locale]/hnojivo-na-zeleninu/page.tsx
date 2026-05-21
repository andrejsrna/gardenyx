import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-plus-zelenina';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojivo-na-zeleninu',
  en: '/en/vegetable-fertilizer',
  hu: '/hu/zoldseg-mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'Hnojivo na zeleninu: paradajky, uhorky a záhrada | GardenYX',
    metaDescription:
      'Vyberte si vyvážené NPK hnojivo na zeleninu. Hakofyt Plus zelenina podporuje korene, fotosyntézu, príjem živín a kvalitu úrody.',
    eyebrow: 'Hnojivo na zeleninu',
    title: 'Hnojivo na zeleninu pre silné korene, zdravé listy a kvalitnejšiu úrodu',
    intro:
      'Zelenina potrebuje počas sezóny pravidelnú a vyváženú výživu. Hakofyt Plus zelenina spája NPK živiny, stopové prvky, humínové látky, aminokyseliny a prírodné stimulátory rastu pre paradajky, uhorky, papriku, zemiaky, šaláty aj bylinky.',
    primaryCta: 'Kúpiť hnojivo na zeleninu',
    secondaryCta: 'Pozrieť všetky hnojivá',
    productEyebrow: 'Odporúčaný produkt',
    productText:
      'Vyvážené listové NPK hnojivo pre všetku zeleninu. Podporuje rozvoj koreňov, fotosyntézu, príjem živín a kvalitu plodín.',
    priceLabel: 'Cena od',
    inStock: 'Skladom',
    outOfStock: 'Na dopyt',
    detailLabel: 'Detail produktu',
    useTitle: 'Kedy použiť hnojivo na zeleninu',
    uses: [
      ['Po výsadbe', 'keď sa sadenice ujímajú a potrebujú podporiť korene aj prvý rast.'],
      ['Počas intenzívneho rastu', 'keď rastlina tvorí listy, výhony a potrebuje pravidelný prísun živín.'],
      ['Pri tvorbe plodov', 'keď paradajky, uhorky, paprika alebo iná zelenina potrebujú výživu pre kvalitu úrody.'],
    ],
    applyTitle: 'Ako aplikovať listové hnojivo na zeleninu',
    steps: [
      ['01', 'Rieďte podľa etikety', 'Dodržte odporúčané dávkovanie pre konkrétnu plodinu a fázu rastu.'],
      ['02', 'Aplikujte mimo horúčav', 'Najlepšie ráno alebo večer, nie na priamom slnku a nie na prehriate rastliny.'],
      ['03', 'Opakujte počas sezóny', 'Zelenina reaguje najlepšie na pravidelnú výživu v rozumných intervaloch.'],
    ],
    relatedTitle: 'Súvisiace témy',
    related: [
      ['/hnojivo', 'Hnojivo pre záhradu'],
      ['/npk-hnojivo', 'Čo znamená NPK hnojivo'],
      ['/organicke-hnojivo', 'Organické hnojivo'],
    ],
    faqTitle: 'Časté otázky k hnojivu na zeleninu',
    faqs: [
      ['Aké hnojivo je vhodné na zeleninu?', 'Na zeleninu je vhodné vyvážené hnojivo s NPK živinami a stopovými prvkami. Hakofyt Plus zelenina je určený na pravidelnú listovú výživu počas sezóny.'],
      ['Môžem použiť hnojivo na paradajky aj uhorky?', 'Áno, Hakofyt Plus zelenina je univerzálne hnojivo pre zeleninu vrátane paradajok, uhoriek, papriky, zemiakov, šalátov a byliniek.'],
      ['Kedy hnojiť zeleninu?', 'Najčastejšie po výsadbe, počas intenzívneho rastu a pri tvorbe plodov. Vyhnite sa aplikácii počas horúčav a silného priameho slnka.'],
      ['Je listové hnojivo vhodné pre hobby záhradu?', 'Áno. Pri dodržaní dávkovania je praktické aj pre hobby pestovateľov, pretože živiny sa cez listy prijímajú rýchlo.'],
    ],
  },
  en: {
    metaTitle: 'Vegetable fertilizer for tomatoes, cucumbers and garden crops | GardenYX',
    metaDescription:
      'Choose balanced NPK vegetable fertilizer. Hakofyt Plus Vegetables supports roots, photosynthesis, nutrient uptake and crop quality.',
    eyebrow: 'Vegetable fertilizer',
    title: 'Vegetable fertilizer for stronger roots, healthy leaves and better harvest quality',
    intro:
      'Vegetables need regular and balanced nutrition during the season. Hakofyt Plus Vegetables combines NPK nutrients, trace elements, humic substances, amino acids and natural growth stimulators for tomatoes, cucumbers, peppers, potatoes, salads and herbs.',
    primaryCta: 'Buy vegetable fertilizer',
    secondaryCta: 'View all fertilizers',
    productEyebrow: 'Recommended product',
    productText:
      'Balanced foliar NPK fertilizer for all vegetables. Supports root development, photosynthesis, nutrient uptake and crop quality.',
    priceLabel: 'Price from',
    inStock: 'In stock',
    outOfStock: 'On request',
    detailLabel: 'Product detail',
    useTitle: 'When to use vegetable fertilizer',
    uses: [
      ['After planting', 'when seedlings establish and need support for roots and early growth.'],
      ['During intensive growth', 'when the plant forms leaves and shoots and needs regular nutrition.'],
      ['During fruit formation', 'when tomatoes, cucumbers, peppers and other vegetables need nutrition for crop quality.'],
    ],
    applyTitle: 'How to apply foliar fertilizer to vegetables',
    steps: [
      ['01', 'Dilute according to the label', 'Follow the recommended dosing for the crop and growth stage.'],
      ['02', 'Apply outside heat', 'Prefer morning or evening, not in direct sun and not on overheated plants.'],
      ['03', 'Repeat during the season', 'Vegetables respond best to regular nutrition in sensible intervals.'],
    ],
    relatedTitle: 'Related topics',
    related: [
      ['/hnojivo', 'Garden fertilizer'],
      ['/npk-hnojivo', 'What NPK fertilizer means'],
      ['/organicke-hnojivo', 'Organic fertilizer'],
    ],
    faqTitle: 'Vegetable fertilizer FAQ',
    faqs: [
      ['What fertilizer is suitable for vegetables?', 'Vegetables need balanced fertilizer with NPK nutrients and trace elements. Hakofyt Plus Vegetables is designed for regular foliar nutrition during the season.'],
      ['Can I use it for tomatoes and cucumbers?', 'Yes. Hakofyt Plus Vegetables is suitable for tomatoes, cucumbers, peppers, potatoes, salads and herbs.'],
      ['When should I fertilize vegetables?', 'Most often after planting, during intensive growth and during fruit formation. Avoid application during heat and strong direct sun.'],
      ['Is foliar fertilizer suitable for hobby gardens?', 'Yes. When dosed correctly, it is practical for hobby growers because nutrients are absorbed quickly through leaves.'],
    ],
  },
  hu: {
    metaTitle: 'Zöldség műtrágya paradicsomhoz, uborkához és kerti növényekhez | GardenYX',
    metaDescription:
      'Válasszon kiegyensúlyozott NPK zöldség műtrágyát. A Hakofyt Plus Zöldség támogatja a gyökereket, fotoszintézist, tápanyagfelvételt és termésminőséget.',
    eyebrow: 'Zöldség műtrágya',
    title: 'Zöldség műtrágya erősebb gyökerekhez, egészséges levelekhez és jobb terméshez',
    intro:
      'A zöldségeknek szezon közben rendszeres és kiegyensúlyozott tápanyagellátás kell. A Hakofyt Plus Zöldség NPK tápanyagokat, nyomelemeket, humuszanyagokat, aminosavakat és természetes növekedésserkentőket kombinál.',
    primaryCta: 'Zöldség műtrágya vásárlása',
    secondaryCta: 'Minden műtrágya',
    productEyebrow: 'Ajánlott termék',
    productText:
      'Kiegyensúlyozott lombon keresztüli NPK műtrágya minden zöldséghez. Támogatja a gyökérfejlődést, fotoszintézist, tápanyagfelvételt és termésminőséget.',
    priceLabel: 'Ár ettől',
    inStock: 'Raktáron',
    outOfStock: 'Rendelésre',
    detailLabel: 'Termék részletei',
    useTitle: 'Mikor használjon zöldség műtrágyát',
    uses: [
      ['Ültetés után', 'amikor a palánták begyökeresednek és támogatásra van szükségük.'],
      ['Intenzív növekedéskor', 'amikor a növény leveleket és hajtásokat fejleszt.'],
      ['Termésképzéskor', 'amikor a paradicsom, uborka, paprika vagy más zöldség tápanyagot igényel.'],
    ],
    applyTitle: 'Hogyan alkalmazza a lombtrágyát zöldségeken',
    steps: [
      ['01', 'Hígítsa a címke szerint', 'Tartsa be az ajánlott adagolást a növény és fejlődési szakasz szerint.'],
      ['02', 'Ne hőségben alkalmazza', 'Reggel vagy este ideális, nem közvetlen napsütésben.'],
      ['03', 'Ismételje szezon közben', 'A zöldségek a rendszeres tápanyagellátásra reagálnak a legjobban.'],
    ],
    relatedTitle: 'Kapcsolódó témák',
    related: [
      ['/hnojivo', 'Kerti műtrágya'],
      ['/npk-hnojivo', 'Mit jelent az NPK'],
      ['/organicke-hnojivo', 'Szerves műtrágya'],
    ],
    faqTitle: 'Gyakori kérdések zöldség műtrágyához',
    faqs: [
      ['Milyen műtrágya alkalmas zöldségekhez?', 'Kiegyensúlyozott NPK tápanyagokat és nyomelemeket tartalmazó műtrágya ajánlott.'],
      ['Használható paradicsomhoz és uborkához?', 'Igen. A Hakofyt Plus Zöldség paradicsomhoz, uborkához, paprikához, burgonyához, salátához és fűszernövényekhez is alkalmas.'],
      ['Mikor trágyázzuk a zöldségeket?', 'Ültetés után, intenzív növekedéskor és termésképzéskor. Kerülje a hőséget és az erős direkt napfényt.'],
      ['Alkalmas hobby kertbe?', 'Igen. Helyes adagolással praktikus megoldás hobby kertészeknek is.'],
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

export default async function VegetableFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
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
            <Link key={href} href={href as AnyHref} className="rounded-3xl border border-emerald-100 bg-white p-6 font-bold text-emerald-800 shadow-sm hover:border-emerald-300">
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
