import { Metadata } from 'next';
import { getRankMathSEO } from './lib/wordpress';
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
  const seoData = await getRankMathSEO(process.env.WORDPRESS_URL!);
  
  if (seoData) {
    // Parse the head HTML using our utility
    const parser = parseHTML(seoData.head);
    
    return {
      title: parser.getTitle() || 'Najsilnejšia kĺbová výživa',
      description: parser.getMetaTag('description') || 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
      openGraph: {
        title: parser.getMetaTag('og:title') || 'Najsilnejšia kĺbová výživa',
        description: parser.getMetaTag('og:description') || 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
        url: parser.getMetaTag('og:url') || siteUrl,
        siteName: parser.getMetaTag('og:site_name') || 'Najsilnejšia kĺbová výživa',
        images: parser.getMetaTag('og:image') 
          ? [{
              url: parser.getMetaTag('og:image') || '',
              width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
              height: parseInt(parser.getMetaTag('og:image:height') || '630'),
            }]
          : [{
              url: `${siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
            }],
        locale: 'sk_SK',
        type: (parser.getMetaTag('og:type') || 'website') as 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: parser.getMetaTag('twitter:title') || 'Najsilnejšia kĺbová výživa',
        description: parser.getMetaTag('twitter:description') || 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
        images: parser.getMetaTag('twitter:image') 
          ? [{ url: parser.getMetaTag('twitter:image')! }]
          : [`${siteUrl}/og-image.jpg`],
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
    title: 'Najsilnejšia kĺbová výživa',
    description: 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
    openGraph: {
      title: 'Najsilnejšia kĺbová výživa',
      description: 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
      url: siteUrl,
      siteName: 'Najsilnejšia kĺbová výživa',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'sk_SK',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Najsilnejšia kĺbová výživa',
      description: 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
      images: [`${siteUrl}/og-image.jpg`],
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
    </main>
  );
}
