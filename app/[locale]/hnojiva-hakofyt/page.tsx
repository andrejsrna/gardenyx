import Image from 'next/image';
import NextLink from 'next/link';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProductShowcaseSection from '../../components/ProductShowcaseSection';
import { getAllProducts } from '../../lib/products';

const HAKOFYT_CATEGORY_ORDER = [
  'hnojiva-hakofyt-b',
  'hnojiva-hakofyt-plus',
  'hnojiva-hakofyt-max',
] as const;

const localeToPath: Record<string, string> = {
  sk: '/sk/hnojiva-hakofyt',
  en: '/en/hakofyt-fertilizers',
  hu: '/hu/hakofyt-mutragyak',
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hakofytFertilizersPage.meta' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gardenyx.eu';
  const path = localeToPath[locale] || '/hnojiva-hakofyt';
  const canonical = `${siteUrl}${path}`;
  const localeAlternates = Object.fromEntries(
    Object.entries(localeToPath).map(([alternateLocale, alternatePath]) => [
      alternateLocale,
      `${siteUrl}${alternatePath}`,
    ]),
  );

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: localeAlternates,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonical,
      siteName: 'GardenYX',
      locale: localeToOgLocale[locale] || 'sk_SK',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/images/pages/hakofyt-fertilizers-hero.png`,
          width: 1600,
          height: 900,
          alt: t('imageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${siteUrl}/images/pages/hakofyt-fertilizers-hero.png`],
    },
  };
}

export default async function HakofytFertilizersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hakofytFertilizersPage' });

  const allProducts = await getAllProducts(locale);
  const hakofytProducts = allProducts
    .filter((product) =>
      product.categories.some((category) =>
        HAKOFYT_CATEGORY_ORDER.includes(category.slug as typeof HAKOFYT_CATEGORY_ORDER[number]),
      ),
    )
    .sort((a, b) => {
      const aCategoryIndex = HAKOFYT_CATEGORY_ORDER.findIndex((slug) =>
        a.categories.some((category) => category.slug === slug),
      );
      const bCategoryIndex = HAKOFYT_CATEGORY_ORDER.findIndex((slug) =>
        b.categories.some((category) => category.slug === slug),
      );

      if (aCategoryIndex !== bCategoryIndex) {
        return aCategoryIndex - bCategoryIndex;
      }

      return a.wcId - b.wcId;
    });

  const benefits = [
    {
      title: t('benefits.vitality.title'),
      description: t('benefits.vitality.description'),
    },
    {
      title: t('benefits.resistance.title'),
      description: t('benefits.resistance.description'),
    },
    {
      title: t('benefits.synergy.title'),
      description: t('benefits.synergy.description'),
    },
  ];
  const faqItems = [
    {
      question: t('faq.items.what.question'),
      answer: t('faq.items.what.answer'),
    },
    {
      question: t('faq.items.types.question'),
      answer: t('faq.items.types.answer'),
    },
    {
      question: t('faq.items.use.question'),
      answer: t('faq.items.use.answer'),
    },
  ];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gardenyx.eu';
  const canonical = `${siteUrl}${localeToPath[locale] || localeToPath.sk}`;
  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: t('meta.title'),
        description: t('meta.description'),
        inLanguage: locale,
        isPartOf: {
          '@type': 'WebSite',
          name: 'GardenYX',
          url: siteUrl,
        },
        about: {
          '@type': 'Thing',
          name: 'Hakofyt',
          description: t('schema.about'),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: faqItems.map((item) => ({
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
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <section className="overflow-hidden border-b border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white">
        <div className="container mx-auto grid gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800 w-fit">
              {t('eyebrow')}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-5 text-lg leading-8 text-stone-600">
              {t('description')}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-lg">
            <div className="relative aspect-[4/3] bg-white p-4 sm:p-6">
              <Image
                src="/images/pages/hakofyt-fertilizers-hero.png"
                alt={t('meta.imageAlt')}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-green-800 w-fit">
              {t('principle.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {t('principle.title')}
            </h2>
            <h3 className="mt-6 text-xl font-semibold text-stone-900">
              {t('principle.subtitle')}
            </h3>
            <div className="mt-4 space-y-4 text-base leading-8 text-stone-600">
              <p>{t('principle.paragraph1')}</p>
              <p>{t('principle.paragraph2')}</p>
            </div>
          </div>
        </div>
      </section>

      <ProductShowcaseSection
        eyebrow={t('featuredProducts.eyebrow')}
        title={t('featuredProducts.title')}
        description={t('featuredProducts.description')}
        detailLabel={t('featuredProducts.detail')}
        products={hakofytProducts}
        className="bg-stone-50 py-16 sm:py-20"
      />

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-stone-900">{benefit.title}</h2>
                <p className="mt-4 text-base leading-8 text-stone-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-emerald-100 bg-gradient-to-b from-white to-emerald-50 py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-green-800 w-fit">
              {t('roi.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {t('roi.title')}
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-600">
              {t('roi.description')}
            </p>
            <NextLink
              href={t('roi.linkHref')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-emerald-500 hover:text-emerald-700"
            >
              {t('roi.linkLabel')}
            </NextLink>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">
              {t('faq.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {t('faq.title')}
            </h2>
            <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {faqItems.map((item) => (
                <article key={item.question} className="py-6">
                  <h3 className="text-xl font-semibold text-stone-900">{item.question}</h3>
                  <p className="mt-3 text-base leading-8 text-stone-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
