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
  // Get RankMath SEO data for homepage
  const seoData = await getRankMathSEO('https://najsilnejsiaklbovavyziva.sk');
  
  if (!seoData) {
    // Fallback metadata if RankMath data is not available
    return {
      title: 'Najsilnejšia kĺbová výživa',
      description: 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
      openGraph: {
        title: 'Najsilnejšia kĺbová výživa',
        description: 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
        url: 'https://najsilnejsiaklbovavyziva.sk',
        siteName: 'Najsilnejšia kĺbová výživa',
        images: [
          {
            url: 'https://najsilnejsiaklbovavyziva.sk/og-image.jpg', // Make sure to add your OG image
            width: 1200,
            height: 630,
          },
        ],
        locale: 'sk_SK',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Najsilnejšia kĺbová výživa',
        description: 'Prírodná kĺbová výživa pre zdravé a silné kĺby. Overené zákazníkmi.',
        images: ['https://najsilnejsiaklbovavyziva.sk/og-image.jpg'], // Same as OG image
      },
      alternates: {
        canonical: 'https://najsilnejsiaklbovavyziva.sk',
      },
      robots: {
        index: true,
        follow: true,
      },
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
      verification: {
        google: 'your-google-verification-code', // Add your Google verification code if you have one
      },
    };
  }

  // Parse the head HTML using our utility
  const parser = parseHTML(seoData.head);
  
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
        : undefined,
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
      canonical: parser.getMetaTag('canonical'),
    },
    robots: {
      index: parser.getMetaTag('robots')?.includes('noindex') ? false : true,
      follow: parser.getMetaTag('robots')?.includes('nofollow') ? false : true,
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
