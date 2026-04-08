import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/moj-ucet/',
        '/pokladna/',
        '/objednavka/',
        '/_next/',
        '/admin/',
        '/wp-admin/',
        '/wp-content/',
        '/wp-includes/',
        '*.json$',
        '/*.xml$',
        '/sentry-example*',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.gardenyx.eu'}/sitemap.xml`,
  };
} 