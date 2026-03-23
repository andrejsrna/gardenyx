import { Product } from '@/app/lib/content-types';

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
  pageUrl 
}: CollectionPageSchemaProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": pageUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://najsilnejsiaklbovavyziva.sk/produkt/${product.slug}`,
        "item": {
          "@type": "Thing",
          "name": product.name,
          "url": `https://najsilnejsiaklbovavyziva.sk/produkt/${product.slug}`
        }
      }))
    },
    "publisher": {
      "@type": "Organization",
      "name": "Najsilnejšia kĺbová výživa",
      "url": "https://najsilnejsiaklbovavyziva.sk"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 
