import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/app/lib/products';

const PRODUCT_SLUG = 'hakofyt-plus-startovacie-hnojivo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/startovacie-hnojivo',
  en: '/en/starter-fertilizer',
  hu: '/hu/indito-mutragya',
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
    metaTitle: 'Štartovacie hnojivo pre sadenice a zakorenenie | GardenYX',
    metaDescription:
      'Hakofyt Plus štartovacie hnojivo podporuje zakorenenie, ujatie sadeníc a zdravý štart po presadení. Cielená výživa pre mladé rastliny.',
    eyebrow: 'Štartovacie hnojivo',
    title: 'Štartovacie hnojivo pre silné sadenice, dobré zakorenenie a zdravý štart',
    intro:
      'Mladé rastliny po presadení a sadenice potrebujú iný režim výživy než dospelé plodiny. Hakofyt Plus štartovacie hnojivo je určené pre podporu zakorenenia, ujatia sadeníc a rovnomerného rastu hneď po výsadbe.',
    primaryCta: 'Kúpiť štartovacie hnojivo',
    secondaryCta: 'Pozrieť všetky hnojivá',
    productEyebrow: 'Odporúčaný produkt',
    productText:
      'Listové hnojivo pre sadenice a mladé rastliny. Podporuje zakorenenie, prekonanie presádzacieho stresu a zdravý štart po výsadbe.',
    priceLabel: 'Cena od',
    inStock: 'Skladom',
    outOfStock: 'Na dopyt',
    detailLabel: 'Detail produktu',
    useTitle: 'Kedy použiť štartovacie hnojivo',
    uses: [
      ['Po presadení', 'keď sadenica potrebuje čas na zakorenenie a zvládnutie presádzacieho stresu.'],
      ['Pri raste mladých rastlín', 'keď chcete podporiť rovnomerný rast listov a koreňov na začiatku sezóny.'],
      ['Pri zakladaní záhonov a nádob', 'keď sadíte nové rastliny do záhrady, skleníka alebo väčších kvetináčov.'],
    ],
    applyTitle: 'Ako použiť štartovacie hnojivo',
    steps: [
      ['01', 'Dodržte riedenie podľa etikety', 'Sadenice sú citlivé, preto nikdy neprekračujte odporúčanú dávku a riedenie.'],
      ['02', 'Aplikujte ráno alebo večer', 'Mladé rastliny nehnojte na priamom poludňajšom slnku ani v strese zo sucha.'],
      ['03', 'Sledujte reakciu rastlín', 'Začnite mierne a výživu upravte podľa rastu, farby listov a stavu substrátu.'],
    ],
    relatedTitle: 'Súvisiace témy',
    related: [
      ['/hnojivo', 'Hnojivo pre záhradu'],
      ['/hnojivo-na-zeleninu', 'Hnojivo na zeleninu'],
      ['npkArticle', 'Čo znamená NPK hnojivo'],
    ],
    faqTitle: 'Časté otázky k štartovaciemu hnojivu',
    faqs: [
      ['Čo je štartovacie hnojivo?', 'Je to hnojivo určené pre mladé rastliny a sadenice. Cieľom je podporiť zakorenenie a zdravý štart po výsadbe, nie silný rast za každú cenu.'],
      ['Kedy použiť štartovacie hnojivo?', 'Najčastejšie po presadení, pri sadení nových rastlín a na začiatku vegetačnej sezóny.'],
      ['Je vhodné pre všetky rastliny?', 'Je vhodné pre zeleninové sadenice, okrasné rastliny a mladé rastliny. Dávkovanie vždy prispôsobte druhu a etikete.'],
      ['Môžem ním hnojiť aj dospelé rastliny?', 'Skôr nie. Pre dospelé plodiny je vhodnejšie hnojivo podľa konkrétneho typu rastliny, napríklad na zeleninu, kvety alebo ovocné dreviny.'],
    ],
  },
  en: {
    metaTitle: 'Starter fertilizer for seedlings and rooting | GardenYX',
    metaDescription:
      'Hakofyt Plus Starter Fertilizer supports rooting, seedling establishment and a healthy start after transplanting. Targeted nutrition for young plants.',
    eyebrow: 'Starter fertilizer',
    title: 'Starter fertilizer for strong seedlings, good rooting and a healthy start',
    intro:
      'Young plants after transplanting and seedlings need a different feeding routine than mature crops. Hakofyt Plus Starter Fertilizer supports rooting, establishment and even growth right after planting.',
    primaryCta: 'Buy starter fertilizer',
    secondaryCta: 'View all fertilizers',
    productEyebrow: 'Recommended product',
    productText:
      'Foliar fertilizer for seedlings and young plants. Supports rooting, recovery from transplant stress and a healthy start after planting.',
    priceLabel: 'Price from',
    inStock: 'In stock',
    outOfStock: 'On request',
    detailLabel: 'Product detail',
    useTitle: 'When to use starter fertilizer',
    uses: [
      ['After transplanting', 'when seedlings need time to root and recover from transplant stress.'],
      ['During young plant growth', 'when you want even leaf and root growth early in the season.'],
      ['When planting beds and containers', 'when you set new plants into garden beds, greenhouses or larger pots.'],
    ],
    applyTitle: 'How to apply starter fertilizer',
    steps: [
      ['01', 'Follow the label dilution', 'Seedlings are sensitive, so never exceed the recommended dose and dilution.'],
      ['02', 'Apply in the morning or evening', 'Do not feed young plants in direct midday sun or drought stress.'],
      ['03', 'Watch how plants respond', 'Start gently and adjust nutrition based on growth, leaf color and substrate condition.'],
    ],
    relatedTitle: 'Related topics',
    related: [
      ['/hnojivo', 'Garden fertilizer'],
      ['/hnojivo-na-zeleninu', 'Vegetable fertilizer'],
      ['npkArticle', 'What NPK fertilizer means'],
    ],
    faqTitle: 'Starter fertilizer FAQ',
    faqs: [
      ['What is starter fertilizer?', 'It is fertilizer made for young plants and seedlings. The goal is to support rooting and a healthy start after planting, not strong growth at any cost.'],
      ['When should I use starter fertilizer?', 'Most often after transplanting, when planting new plants and at the start of the growing season.'],
      ['Is it suitable for all plants?', 'It suits vegetable seedlings, ornamental plants and young plants. Always adjust dosage to the species and label.'],
      ['Can I use it on mature plants?', 'Prefer not. For mature crops, a fertilizer made for the specific plant type, such as vegetables, flowers or fruit trees, is more suitable.'],
    ],
  },
  hu: {
    metaTitle: 'Indító műtrágya palántákhoz és gyökeresedéshez | GardenYX',
    metaDescription:
      'A Hakofyt Plus Indító műtrágya támogatja a gyökeresedést, a palánták megeredését és az egészséges indulást ültetés után. Célzott tápanyagellátás fiatal növényekhez.',
    eyebrow: 'Indító műtrágya',
    title: 'Indító műtrágya erős palántákhoz, jó gyökeresedéshez és egészséges induláshoz',
    intro:
      'Az ültetés utáni fiatal növények és palánták más tápanyagellátást igényelnek, mint a kifejlett növények. A Hakofyt Plus Indító műtrágya a gyökeresedést, a palánták megeredését és az egyenletes növekedést támogatja közvetlenül kiültetés után.',
    primaryCta: 'Indító műtrágya vásárlása',
    secondaryCta: 'Minden műtrágya',
    productEyebrow: 'Ajánlott termék',
    productText:
      'Lombtrágya palántákhoz és fiatal növényekhez. Támogatja a gyökeresedést, az átültetési stressz leküzdését és az egészséges indulást.',
    priceLabel: 'Ár ettől',
    inStock: 'Raktáron',
    outOfStock: 'Rendelésre',
    detailLabel: 'Termék részletei',
    useTitle: 'Mikor használjunk indító műtrágyát',
    uses: [
      ['Ültetés után', 'amikor a palántának időre van szüksége a gyökeresedéshez és az átültetési stressz feldolgozásához.'],
      ['Fiatal növények növekedésekor', 'ha a szezon elején egyenletes levél- és gyökérnövekedést szeretne.'],
      ['Ágyások és edények kialakításakor', 'új növények kiültetésekor kertbe, üvegházba vagy nagyobb cserépbe.'],
    ],
    applyTitle: 'Hogyan alkalmazzuk az indító műtrágyát',
    steps: [
      ['01', 'Kövesse a címke hígítását', 'A palánták érzékenyek, ezért soha ne lépje túl az ajánlott adagot és hígítást.'],
      ['02', 'Reggel vagy este permetezzen', 'Fiatal növényeket ne trágyázzon tűző déli napon vagy vízhiány okozta stresszben.'],
      ['03', 'Figyelje a növények reakcióját', 'Kezdje kíméletesen, és a növekedés, levélszín és közeg állapota szerint igazítson.'],
    ],
    relatedTitle: 'Kapcsolódó témák',
    related: [
      ['/hnojivo', 'Kerti műtrágya'],
      ['/hnojivo-na-zeleninu', 'Zöldség műtrágya'],
      ['npkArticle', 'Mit jelent az NPK műtrágya'],
    ],
    faqTitle: 'Gyakori kérdések az indító műtrágyáról',
    faqs: [
      ['Mi az indító műtrágya?', 'Fiatal növényekhez és palántákhoz készült műtrágya. A cél a gyökeresedés és az egészséges indulás támogatása, nem az erőltetett növekedés.'],
      ['Mikor használjam?', 'Leginkább ültetés után, új növények kiültetésekor és a vegetációs szezon elején.'],
      ['Alkalmas minden növényhez?', 'Zöldségpalántákhoz, dísznövényekhez és fiatal növényekhez alkalmas. Az adagolást mindig a fajhoz és a címkéhez igazítsa.'],
      ['Használhatom kifejlett növényeken?', 'Inkább nem. Kifejlett növényekhez a konkrét típushoz készült műtrágya a megfelelő, például zöldség, virág vagy gyümölcsfa.'],
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

export default async function StarterFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
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
                href === 'npkArticle'
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
