import { Metadata } from 'next';
import { getRankMathSEO } from '../lib/wordpress';
import { parseHTML } from '../lib/html-parser';
import ShopContent from './ShopContent';

export async function generateMetadata(): Promise<Metadata> {
  // Get RankMath SEO data for shop page
  const seoData = await getRankMathSEO('https://najsilnejsiaklbovavyziva.sk/kupit');
  
  if (!seoData) {
    // Fallback metadata if RankMath data is not available
    return {
      title: 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
      description: 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 24 hodín.',
      openGraph: {
        title: 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
        description: 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 24 hodín.',
        url: 'https://najsilnejsiaklbovavyziva.sk/kupit',
        siteName: 'Najsilnejšia kĺbová výživa',
        images: [
          {
            url: 'https://najsilnejsiaklbovavyziva.sk/og-image-shop.jpg',
            width: 1200,
            height: 630,
          },
        ],
        locale: 'sk_SK',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Kúpiť kĺbovú výživu | Najsilnejšia kĺbová výživa',
        description: 'Kúpte si najsilnejšiu kĺbovú výživu na trhu. Prírodné zloženie, overené zákazníkmi. Doprava zadarmo nad 39€. Doručenie do 24 hodín.',
        images: ['https://najsilnejsiaklbovavyziva.sk/og-image-shop.jpg'],
      },
      alternates: {
        canonical: 'https://najsilnejsiaklbovavyziva.sk/kupit',
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

  // Parse the head HTML using our utility
  const parser = parseHTML(seoData.head);
  
  // Get all meta tags to check for structured data
  const allMetaTags = parser.getAllMetaTags();
  
  return {
    title: parser.getTitle(),
    description: parser.getMetaTag('description'),
    openGraph: {
      title: parser.getMetaTag('og:title'),
      description: parser.getMetaTag('og:description'),
      url: parser.getMetaTag('og:url'),
      siteName: parser.getMetaTag('og:site_name'),
      images: parser.getMetaTag('og:image') 
        ? [{
            url: parser.getMetaTag('og:image') || '',
            width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
            height: parseInt(parser.getMetaTag('og:image:height') || '630'),
          }]
        : [],
      locale: 'sk_SK',
      type: (parser.getMetaTag('og:type') || 'website') as 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: parser.getMetaTag('twitter:title'),
      description: parser.getMetaTag('twitter:description'),
      images: parser.getMetaTag('twitter:image') 
        ? [{ url: parser.getMetaTag('twitter:image')! }] 
        : undefined,
    },
    alternates: {
      canonical: parser.getCanonical() || 'https://najsilnejsiaklbovavyziva.sk/kupit',
    },
    robots: {
      index: parser.getRobots()?.includes('noindex') ? false : true,
      follow: parser.getRobots()?.includes('nofollow') ? false : true,
    },
    other: {
      // Preserve any additional meta tags from RankMath
      ...Object.fromEntries(
        Object.entries(allMetaTags)
          .filter(([key]) => !key.startsWith('og:') && !key.startsWith('twitter:'))
      ),
    },
  };
}

export default function ShopPage() {
  return <ShopContent />;
} 