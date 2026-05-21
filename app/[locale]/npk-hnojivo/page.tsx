import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getAllProducts } from '@/app/lib/products';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const localeToPath: Record<string, string> = {
  sk: '/sk/npk-hnojivo',
  en: '/en/npk-fertilizer',
  hu: '/hu/npk-mutragya',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const copy = {
  sk: {
    metaTitle: 'NPK hnojivo: čo znamená NPK a ako vybrať správne | GardenYX',
    metaDescription:
      'NPK hnojivo dodáva rastlinám dusík, fosfor a draslík. Pozrite si, ako čítať pomer NPK a ktoré hnojivo Hakofyt zvoliť pre trávnik, zeleninu či ovocné stromy.',
    eyebrow: 'NPK hnojivo',
    title: 'NPK hnojivo bez hádania: dusík, fosfor a draslík podľa toho, čo pestujete',
    intro:
      'NPK je základ výživy rastlín. Dusík podporuje rast zelenej hmoty, fosfor korene a kvitnutie, draslík odolnosť a kvalitu úrody. Pri výbere však nestačí pozerať iba na čísla na etikete - dôležitý je aj typ rastliny, sezóna a spôsob aplikácie.',
    primaryCta: 'Vybrať NPK hnojivo',
    secondaryCta: 'Prečítať článok o NPK',
    whatTitle: 'Čo znamená NPK',
    nutrients: [
      ['N - dusík', 'Podporuje rast listov, sýtozelenú farbu a rýchle zapojenie porastu. Dôležitý je najmä pri trávniku a rastovej fáze zeleniny.'],
      ['P - fosfor', 'Pomáha koreňom, zakoreňovaniu, kvitnutiu a štartu mladých rastlín. Zmysel dáva pri sadeniciach a po výsadbe.'],
      ['K - draslík', 'Zlepšuje odolnosť, hospodárenie s vodou, vyzrievanie pletív a kvalitu plodov. Dôležitý je pri ovocí, zelenine aj záťaži počas sucha.'],
    ],
    chooseTitle: 'Ako vybrať NPK hnojivo podľa rastliny',
    useCases: [
      ['Trávnik', 'vyšší dôraz na dusík a železo', '/hnojivo-na-travnik', 'Hnojivo na trávnik'],
      ['Ovocné stromy', 'vyvážená výživa pre kvitnutie, plody a vitalitu', '/hnojivo-na-ovocne-stromy', 'Hnojivo na ovocné stromy'],
      ['Celá záhrada', 'prehľad Hakofyt listových hnojív podľa použitia', '/hnojivo', 'Všetky hnojivá'],
    ],
    productsTitle: 'Odporúčané NPK hnojivá Hakofyt',
    productsText:
      'Hakofyt kombinuje NPK živiny s mikroprvkami a organickými podpornými látkami. Preto je praktický, keď chcete rýchlu listovú výživu a zároveň cielenejšie zloženie podľa pestovanej rastliny.',
    faqTitle: 'Časté otázky k NPK hnojivu',
    faqs: [
      ['Čo znamená NPK hnojivo?', 'NPK označuje tri hlavné živiny: dusík, fosfor a draslík. Ich pomer ovplyvňuje rast listov, koreňov, kvitnutie, plody a odolnosť rastlín.'],
      ['Je vyššie NPK číslo vždy lepšie?', 'Nie. Vyššia koncentrácia neznamená automaticky lepší výsledok. Dôležité je dávkovanie, rastlina, sezóna a to, či ide o listovú alebo pôdnu aplikáciu.'],
      ['Aké NPK hnojivo použiť na trávnik?', 'Trávnik zvyčajne potrebuje viac dusíka, najmä na jar a počas aktívneho rastu. V sortimente GardenYX je na to určený Hakofyt Max tráva.'],
      ['Aké NPK hnojivo je vhodné na zeleninu?', 'Zelenina potrebuje vyváženú výživu počas rastu aj tvorby úrody. Vhodnou voľbou je Hakofyt Plus zelenina.'],
    ],
  },
  en: {
    metaTitle: 'NPK fertilizer: what NPK means and how to choose | GardenYX',
    metaDescription:
      'NPK fertilizer supplies nitrogen, phosphorus and potassium. Learn how to read NPK ratios and choose Hakofyt fertilizer for lawns, vegetables or fruit trees.',
    eyebrow: 'NPK fertilizer',
    title: 'NPK fertilizer made clear: nitrogen, phosphorus and potassium by plant type',
    intro:
      'NPK is the foundation of plant nutrition. Nitrogen supports green growth, phosphorus roots and flowering, potassium resistance and crop quality. The right choice depends on the plant, season and application method.',
    primaryCta: 'Choose NPK fertilizer',
    secondaryCta: 'Read the NPK article',
    whatTitle: 'What NPK means',
    nutrients: [
      ['N - nitrogen', 'Supports leaf growth, green color and fast lawn recovery.'],
      ['P - phosphorus', 'Supports roots, establishment, flowering and young plants.'],
      ['K - potassium', 'Improves resistance, water management and crop quality.'],
    ],
    chooseTitle: 'How to choose NPK fertilizer by plant',
    useCases: [
      ['Lawn', 'more focus on nitrogen and iron', '/hnojivo-na-travnik', 'Lawn fertilizer'],
      ['Fruit trees', 'balanced nutrition for flowering, fruit and vitality', '/hnojivo-na-ovocne-stromy', 'Fruit tree fertilizer'],
      ['Whole garden', 'Hakofyt foliar fertilizers by use', '/hnojivo', 'All fertilizers'],
    ],
    productsTitle: 'Recommended Hakofyt NPK fertilizers',
    productsText:
      'Hakofyt combines NPK nutrients with micro-elements and organic support substances, making it useful for targeted foliar nutrition by plant type.',
    faqTitle: 'NPK fertilizer FAQ',
    faqs: [
      ['What does NPK fertilizer mean?', 'NPK stands for nitrogen, phosphorus and potassium, the three main nutrients plants need.'],
      ['Is a higher NPK number always better?', 'No. Concentration alone is not enough. Dosing, plant type, season and application method matter.'],
      ['Which NPK fertilizer should I use on a lawn?', 'Lawns usually need more nitrogen, especially in spring and active growth. Hakofyt Max Lawn is designed for this use.'],
      ['Which NPK fertilizer is suitable for vegetables?', 'Vegetables need balanced nutrition during growth and crop formation. Hakofyt Plus Vegetables is the targeted option.'],
    ],
  },
  hu: {
    metaTitle: 'NPK műtrágya: mit jelent és hogyan válasszon | GardenYX',
    metaDescription:
      'Az NPK műtrágya nitrogént, foszfort és káliumot ad a növényeknek. Ismerje meg az NPK arányokat és válasszon Hakofyt műtrágyát gyephez, zöldséghez vagy gyümölcsfákhoz.',
    eyebrow: 'NPK műtrágya',
    title: 'NPK műtrágya érthetően: nitrogén, foszfor és kálium növénytípus szerint',
    intro:
      'Az NPK a növénytáplálás alapja. A nitrogén a zöld növekedést, a foszfor a gyökereket és virágzást, a kálium az ellenállóságot és termésminőséget támogatja.',
    primaryCta: 'NPK műtrágya választása',
    secondaryCta: 'NPK cikk olvasása',
    whatTitle: 'Mit jelent az NPK',
    nutrients: [
      ['N - nitrogén', 'Támogatja a levélnövekedést és a mélyzöld színt.'],
      ['P - foszfor', 'Segíti a gyökereket, a begyökeresedést és a virágzást.'],
      ['K - kálium', 'Javítja az ellenállóságot, vízháztartást és termésminőséget.'],
    ],
    chooseTitle: 'NPK műtrágya választása növény szerint',
    useCases: [
      ['Gyep', 'nagyobb hangsúly nitrogénen és vason', '/hnojivo-na-travnik', 'Gyeptrágya'],
      ['Gyümölcsfák', 'kiegyensúlyozott tápanyag virágzáshoz és terméshez', '/hnojivo-na-ovocne-stromy', 'Gyümölcsfa trágya'],
      ['Teljes kert', 'Hakofyt lombtrágyák felhasználás szerint', '/hnojivo', 'Minden műtrágya'],
    ],
    productsTitle: 'Ajánlott Hakofyt NPK műtrágyák',
    productsText:
      'A Hakofyt NPK tápanyagokat, mikroelemeket és szerves támogató anyagokat kombinál a célzott lombon keresztüli tápláláshoz.',
    faqTitle: 'Gyakori kérdések az NPK műtrágyáról',
    faqs: [
      ['Mit jelent az NPK műtrágya?', 'Az NPK nitrogént, foszfort és káliumot jelent, a növények három fő tápanyagát.'],
      ['Mindig jobb a magasabb NPK szám?', 'Nem. A dózis, növénytípus, szezon és kijuttatási mód is számít.'],
      ['Milyen NPK műtrágya kell gyephez?', 'A gyep általában több nitrogént igényel, főleg tavasszal és aktív növekedéskor.'],
      ['Milyen NPK műtrágya jó zöldségekhez?', 'A zöldségek kiegyensúlyozott tápanyagot igényelnek növekedés és termésképzés közben.'],
    ],
  },
} as const;

function getCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.sk;
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

export default async function NpkFertilizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getCopy(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gardenyx.eu';
  const canonical = `${siteUrl}${localeToPath[locale] || localeToPath.sk}`;
  const products = (await getAllProducts(locale)).filter((product) =>
    ['hakofyt-max-trava', 'hakofyt-plus-zelenina', 'hakofyt-plus-na-ovocne-dreviny', 'hakofyt-plus-startovacie-hnojivo'].includes(product.slug)
  );

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t.metaTitle,
    description: t.metaDescription,
    url: canonical,
    inLanguage: locale,
  };

  return (
    <main className="bg-[#fbfcf7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="relative overflow-hidden border-b border-lime-900/10 bg-gradient-to-br from-lime-50 via-white to-amber-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-lime-700">{t.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kupit" className="rounded-full bg-lime-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-lime-800">
                {t.primaryCta}
              </Link>
              <Link href={{ pathname: '/blog/[slug]', params: { slug: locale === 'sk' ? 'npk-hnojivo-co-znamena' : locale === 'hu' ? 'npk-mutragya-jelentese' : 'npk-fertilizer-meaning' } }} className="rounded-full border border-lime-700/30 bg-white px-6 py-3 text-sm font-bold text-lime-800 hover:bg-lime-50">
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-lime-900/10 bg-white/80 p-5 shadow-xl shadow-lime-900/5">
            {t.nutrients.map(([title, text]) => (
              <article key={title} className="rounded-3xl bg-lime-50 p-5">
                <h2 className="text-xl font-black text-stone-950">{title}</h2>
                <p className="mt-2 leading-7 text-stone-700">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-700">{t.whatTitle}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950">{t.chooseTitle}</h2>
          </div>
          <div className="grid gap-4">
            {t.useCases.map(([title, text, href, label]) => (
              <article key={title} className="rounded-3xl border border-stone-200 bg-white p-6">
                <h3 className="text-xl font-black text-stone-950">{title}</h3>
                <p className="mt-2 text-stone-700">{text}</p>
                <Link href={href as AnyHref} className="mt-4 inline-flex text-sm font-bold text-lime-700 hover:text-lime-900">
                  {label}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight">{t.productsTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-stone-300">{t.productsText}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={{ pathname: '/produkt/[slug]', params: { slug: product.slug } }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <h3 className="text-lg font-black">{product.name}</h3>
                {product.short_description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-300">{product.short_description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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
