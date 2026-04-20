import { Product } from '@/app/lib/content-types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';

interface CollectionPageSchemaProps {
  products: Product[];
  pageTitle: string;
  pageDescription: string;
  pageUrl: string;
}

export default function CollectionPageSchema({
  products,
  pageTitle,
  pageDescription,
  pageUrl,
}: CollectionPageSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/produkt/${product.slug}`,
        item: {
          '@type': 'Thing',
          name: product.name,
          url: `${SITE_URL}/produkt/${product.slug}`,
        },
      })),
    },
    publisher: {
      '@type': 'Organization',
      name: 'GardenYX',
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
