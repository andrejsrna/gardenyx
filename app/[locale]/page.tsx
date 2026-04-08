import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import AppDownloadSection from '../components/AppDownloadSection';
import HomeHero from '../components/HomeHero';
import HomeLatestProducts from '../components/HomeLatestProducts';

type PageProps = { params: Promise<{ locale: string }> };

const metaByLocale: Record<string, { title: string; description: string }> = {
  sk: {
    title: 'GardenYX – Prírodné hnojivá a stimulátory rastu',
    description:
      'Objavte prírodné hnojivá a stimulátory rastu GardenYX pre bohatú úrodu a kvitnúcu záhradu. Nakupujte bezpečne online s doručením na Slovensku.',
  },
  en: {
    title: 'GardenYX – Natural Fertilizers & Growth Stimulators',
    description:
      'Discover GardenYX natural fertilizers and growth stimulators for a rich harvest and a blooming garden. Shop safely online with delivery across Slovakia.',
  },
  hu: {
    title: 'GardenYX – Természetes műtrágyák és növekedési serkentők',
    description:
      'Fedezze fel a GardenYX természetes műtrágyáit és növekedési serkentőit a bőséges termésért és virágzó kertért. Vásároljon biztonságosan online.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] ?? metaByLocale.sk;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const localePrefix = locale === 'sk' ? '' : `/${locale}`;
  const canonicalUrl = siteUrl ? `${siteUrl}${localePrefix}` : undefined;

  return {
    title: meta.title,
    description: meta.description,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
          languages: {
            'sk': `${siteUrl}`,
            'en': `${siteUrl}/en`,
            'hu': `${siteUrl}/hu`,
          },
        }
      : undefined,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'GardenYX',
      images: siteUrl
        ? [
            {
              url: `${siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: 'GardenYX',
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: siteUrl ? [`${siteUrl}/og-image.jpg`] : [],
    },
  };
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <HomeHero locale={locale} />
      <HomeLatestProducts locale={locale} />
      <AppDownloadSection locale={locale} />
    </main>
  );
}
