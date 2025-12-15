import { Metadata } from 'next';
import { getRankMathSEO } from './lib/content';
import { parseHTML } from './lib/html-parser';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import CTA from './components/CTA';
import CTAWithContent from './components/CTAWithContent';
import Reviews from './components/Reviews';
import Composition from './components/Composition';
import RecentPosts from './components/RecentPosts';
import RecommendedProductsWrapper from './components/RecommendedProductsWrapper';


export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Get RankMath SEO data for homepage
  const seoData = await getRankMathSEO();

  if (seoData) {
    // Parse the head HTML using our utility
    const parser = parseHTML(seoData.head);

    return {
      title: 'Najsilnejšia kĺbová výživa na trhu | JointBoost Duo Set',
      description: 'Hľadáte skutočne účinné riešenie? Objavte najsilnejšiu kĺbovú výživu JointBoost. Unikátny Duo Set: komplexná kĺbová výživa + gél proti bolesti pre dvojitý efekt. Skladom!',
      openGraph: {
        title: 'Najsilnejšia kĺbová výživa na trhu | JointBoost Duo Set',
        description: 'Hľadáte skutočne účinné riešenie? Objavte najsilnejšiu kĺbovú výživu JointBoost. Unikátny Duo Set: komplexná kĺbová výživa + gél proti bolesti pre dvojitý efekt. Skladom!',
        url: parser.getMetaTag('og:url') || siteUrl,
        siteName: parser.getMetaTag('og:site_name') || 'Najsilnejšia kĺbová výživa',
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
        type: (parser.getMetaTag('og:type') || 'website') as 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Najsilnejšia kĺbová výživa na trhu | JointBoost Duo Set',
        description: 'Hľadáte skutočne účinné riešenie? Objavte najsilnejšiu kĺbovú výživu JointBoost. Unikátny Duo Set: komplexná kĺbová výživa + gél proti bolesti pre dvojitý efekt. Skladom!',
        images: parser.getMetaTag('twitter:image')
          ? [{ url: parser.getMetaTag('twitter:image')! }]
          : [`${siteUrl}/logo.png`],
      },
      alternates: {
        canonical: parser.getCanonical() || siteUrl,
      },
      robots: {
        index: parser.getRobots()?.includes('noindex') ? false : true,
        follow: parser.getRobots()?.includes('nofollow') ? false : true,
      },
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
      verification: {
        google: parser.getMetaTag('google-site-verification'),
      },
    };
  }

  // Fallback metadata if RankMath data is not available
  return {
    title: 'Najsilnejšia kĺbová výživa na trhu | JointBoost Duo Set',
    description: 'Hľadáte skutočne účinné riešenie? Objavte najsilnejšiu kĺbovú výživu JointBoost. Unikátny Duo Set: komplexná kĺbová výživa + gél proti bolesti pre dvojitý efekt. Skladom!',
    openGraph: {
      title: 'Najsilnejšia kĺbová výživa na trhu | JointBoost Duo Set',
      description: 'Hľadáte skutočne účinné riešenie? Objavte najsilnejšiu kĺbovú výživu JointBoost. Unikátny Duo Set: komplexná kĺbová výživa + gél proti bolesti pre dvojitý efekt. Skladom!',
      url: siteUrl,
      siteName: 'Najsilnejšia kĺbová výživa',
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
      title: 'Najsilnejšia kĺbová výživa na trhu | JointBoost Duo Set',
      description: 'Hľadáte skutočne účinné riešenie? Objavte najsilnejšiu kĺbovú výživu JointBoost. Unikátny Duo Set: komplexná kĺbová výživa + gél proti bolesti pre dvojitý efekt. Skladom!',
      images: [`${siteUrl}/logo.png`],
    },
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default function Home() {
  return (
    <main>
      <Hero />
      <CTA />
      <Benefits />
      <Composition />
      <CTAWithContent />
      <Reviews />
      <RecommendedProductsWrapper />
      <RecentPosts />
      <CTA />
    </main>
  );
}
