import { Metadata } from 'next';
import { getRankMathSEO } from '../lib/content';
import { parseHTML } from '../lib/html-parser';
import ShopContent from './ShopContent';
import BreadcrumbSchema from '../components/seo/BreadcrumbSchema';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // Get RankMath SEO data for shop page
  const seoData = await getRankMathSEO();
  
  if (seoData) {
    // Parse the head HTML using our utility
    const parser = parseHTML(seoData.head);
    
    return {
      title: parser.getTitle() || 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
      description: parser.getMetaTag('description') || 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 48 hodín.',
      openGraph: {
        title: parser.getMetaTag('og:title') || 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
        description: parser.getMetaTag('og:description') || 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 48 hodín.',
        url: parser.getMetaTag('og:url') || `${siteUrl}/kupit`,
        siteName: parser.getMetaTag('og:site_name') || 'Najsilnejšia kĺbová výživa',
        images: parser.getMetaTag('og:image') 
          ? [{
              url: parser.getMetaTag('og:image') || '',
              width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
              height: parseInt(parser.getMetaTag('og:image:height') || '630'),
            }]
          : [{
              url: `${siteUrl}/og-image-shop.jpg`,
              width: 1200,
              height: 630,
            }],
        locale: 'sk_SK',
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image',
        title: parser.getMetaTag('twitter:title') || 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
        description: parser.getMetaTag('twitter:description') || 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 48 hodín.',
        images: parser.getMetaTag('twitter:image') 
          ? [{ url: parser.getMetaTag('twitter:image')! }]
          : [`${siteUrl}/og-image-shop.jpg`],
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
        'kĺbová výživa',
        'kolagén',
        'glukozamín',
        'chondroitín',
        'msm',
        'boswellia serrata',
        'kurkumín'
      ],
    };
  }

  // Fallback metadata if RankMath data is not available
  return {
    title: 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
    description: 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 48 hodín.',
    openGraph: {
      title: 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
      description: 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 48 hodín.',
      url: `${siteUrl}/kupit`,
      siteName: 'Najsilnejšia kĺbová výživa',
      images: [
        {
          url: `${siteUrl}/og-image-shop.jpg`,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'sk_SK',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
      description: 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 48 hodín.',
      images: [`${siteUrl}/og-image-shop.jpg`],
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
      'kĺbová výživa',
      'kolagén',
      'glukozamín',
      'chondroitín',
      'msm',
      'boswellia serrata',
      'kurkumín'
    ],
  };
}

export default function ShopPage() {
  const breadcrumbItems = [
    { name: 'Domov', url: 'https://najsilnejsiaklbovavyziva.sk' },
    { name: 'Obchod', url: 'https://najsilnejsiaklbovavyziva.sk/kupit' }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ShopContent />
    </>
  );
} 
