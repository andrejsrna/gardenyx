import { Metadata } from 'next';
import { getRankMathSEO } from '../../lib/content';
import { parseHTML } from '../../lib/html-parser';
import ShopContent from './ShopContent';
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const seoData = await getRankMathSEO();

  if (seoData) {
    const parser = parseHTML(seoData.head);

    return {
      title: parser.getTitle() || 'Obchod | GardenYX',
      description: parser.getMetaTag('description') || 'Vyberte si listové hnojivá Hakofyt a prípravky na ochranu rastlín pre záhradu, trávnik aj ovocné dreviny.',
      openGraph: {
        title: parser.getMetaTag('og:title') || 'Obchod | GardenYX',
        description: parser.getMetaTag('og:description') || 'Vyberte si listové hnojivá Hakofyt a prípravky na ochranu rastlín pre záhradu, trávnik aj ovocné dreviny.',
        url: parser.getMetaTag('og:url') || `${siteUrl}/kupit`,
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
        locale: 'sk_SK',
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image',
        title: parser.getMetaTag('twitter:title') || 'Obchod | GardenYX',
        description: parser.getMetaTag('twitter:description') || 'Vyberte si listové hnojivá Hakofyt a prípravky na ochranu rastlín pre záhradu, trávnik aj ovocné dreviny.',
        images: parser.getMetaTag('twitter:image') 
          ? [{ url: parser.getMetaTag('twitter:image')! }]
          : [`${siteUrl}/logo.png`],
      },
      alternates: {
        canonical: parser.getCanonical() || `${siteUrl}/kupit`,
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
    title: 'Obchod | GardenYX',
    description: 'Vyberte si listové hnojivá Hakofyt a prípravky na ochranu rastlín pre záhradu, trávnik aj ovocné dreviny.',
    openGraph: {
      title: 'Obchod | GardenYX',
      description: 'Vyberte si listové hnojivá Hakofyt a prípravky na ochranu rastlín pre záhradu, trávnik aj ovocné dreviny.',
      url: `${siteUrl}/kupit`,
      siteName: 'GardenYX',
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'sk_SK',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Obchod | GardenYX',
      description: 'Vyberte si listové hnojivá Hakofyt a prípravky na ochranu rastlín pre záhradu, trávnik aj ovocné dreviny.',
      images: [`${siteUrl}/logo.png`],
    },
    alternates: {
      canonical: `${siteUrl}/kupit`,
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
  const breadcrumbItems = [
    { name: 'Domov', url: 'https://gardenyx.eu' },
    { name: 'Obchod', url: 'https://gardenyx.eu/kupit' }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ShopContent locale={locale} />
    </>
  );
} 
