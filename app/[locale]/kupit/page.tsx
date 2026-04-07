import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getRankMathSEO } from '../../lib/content';
import { parseHTML } from '../../lib/html-parser';
import ShopContent from './ShopContent';
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema';

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

const localeToShopPath: Record<string, string> = {
  sk: '/kupit',
  en: '/shop',
  hu: '/vasarlas',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const t = await getTranslations({ locale, namespace: 'shop.meta' });
  const seoData = await getRankMathSEO();
  const fallbackTitle = t('title');
  const fallbackDescription = t('description');
  const fallbackUrl = `${siteUrl}${localeToShopPath[locale] || '/kupit'}`;
  const fallbackLocale = localeToOgLocale[locale] || 'sk_SK';
  const preferLocalizedFallback = locale !== 'sk';

  if (seoData) {
    const parser = parseHTML(seoData.head);

    return {
      title: preferLocalizedFallback ? fallbackTitle : (parser.getTitle() || fallbackTitle),
      description: preferLocalizedFallback ? fallbackDescription : (parser.getMetaTag('description') || fallbackDescription),
      openGraph: {
        title: preferLocalizedFallback ? fallbackTitle : (parser.getMetaTag('og:title') || fallbackTitle),
        description: preferLocalizedFallback ? fallbackDescription : (parser.getMetaTag('og:description') || fallbackDescription),
        url: preferLocalizedFallback ? fallbackUrl : (parser.getMetaTag('og:url') || fallbackUrl),
        siteName: parser.getMetaTag('og:site_name') || 'GardenYX',
        images: parser.getMetaTag('og:image') 
          ? [{
              url: parser.getMetaTag('og:image') || '',
              width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
              height: parseInt(parser.getMetaTag('og:image:height') || '630'),
            }]
          : [{
              url: `${siteUrl}/logo.png`,
              width: 1200,
              height: 630,
            }],
        locale: fallbackLocale,
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image',
        title: preferLocalizedFallback ? fallbackTitle : (parser.getMetaTag('twitter:title') || fallbackTitle),
        description: preferLocalizedFallback ? fallbackDescription : (parser.getMetaTag('twitter:description') || fallbackDescription),
        images: parser.getMetaTag('twitter:image') 
          ? [{ url: parser.getMetaTag('twitter:image')! }]
          : [`${siteUrl}/logo.png`],
      },
      alternates: {
        canonical: preferLocalizedFallback ? fallbackUrl : (parser.getCanonical() || fallbackUrl),
      },
      robots: {
        index: parser.getRobots()?.includes('noindex') ? false : true,
        follow: parser.getRobots()?.includes('nofollow') ? false : true,
      },
      other: {
        'price-range': parser.getMetaTag('price-range') || '€€',
        'availability': parser.getMetaTag('availability') || 'in stock',
        'delivery-time': parser.getMetaTag('delivery-time') || '24h',
      },
      keywords: [
        'hnojivo',
        'hakofyt',
        'hnojivá na trávnik',
        'hnojivo na zeleninu',
        'mospilan',
        'bofix'
      ],
    };
  }

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
      url: fallbackUrl,
      siteName: 'GardenYX',
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 1200,
          height: 630,
        },
      ],
      locale: fallbackLocale,
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image',
      title: fallbackTitle,
      description: fallbackDescription,
      images: [`${siteUrl}/logo.png`],
    },
    alternates: {
      canonical: fallbackUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'price-range': '€€',
      'availability': 'in stock',
      'delivery-time': '24h',
    },
    keywords: [
      'hnojivo',
      'hakofyt',
      'hnojivá na trávnik',
      'hnojivo na zeleninu',
      'mospilan',
      'bofix'
    ],
  };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'productPage.breadcrumbs' });
  const breadcrumbItems = [
    { name: t('home'), url: 'https://gardenyx.eu' },
    { name: t('shop'), url: `https://gardenyx.eu${localeToShopPath[locale] || '/kupit'}` }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ShopContent locale={locale} />
    </>
  );
} 
