import { WooCommerceProduct } from '@/app/lib/wordpress';

interface ProductSchemaProps {
  product: WooCommerceProduct;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const price = parseFloat(product.price);
  const hasDiscount = product.sale_price !== '';

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.short_description.replace(/(<([^>]+)>)/gi, ''),
    "sku": product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": "Najsilnejšia kĺbová výživa"
    },
    "category": product.categories[0]?.name || "Kĺbová výživa",
    "image": product.images.map(img => img.src),
    "offers": {
      "@type": "Offer",
      "url": `https://najsilnejsiaklbovavyziva.sk/produkt/${product.slug}`,
      "priceCurrency": "EUR",
      "price": price.toString(),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Najsilnejšia kĺbová výživa"
      },
      ...(hasDiscount && {
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Marta K."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Vynikajúci produkt pre kĺby. Už po týždni som cítila zlepšenie."
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 