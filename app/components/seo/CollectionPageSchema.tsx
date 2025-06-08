import { WooCommerceProduct } from '@/app/lib/wordpress';

interface CollectionPageSchemaProps {
  products: WooCommerceProduct[];
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
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `https://najsilnejsiaklbovavyziva.sk/produkt/${product.slug}`,
          "image": product.images[0]?.src || '',
          "description": product.short_description.replace(/(<([^>]+)>)/gi, ''),
          "offers": {
            "@type": "Offer",
            "priceCurrency": "EUR",
            "price": parseFloat(product.price).toString(),
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Najsilnejšia kĺbová výživa"
            }
          }
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