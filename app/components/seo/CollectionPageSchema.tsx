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
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `https://najsilnejsiaklbovavyziva.sk/produkt/${product.slug}`,
          "image": product.images[0]?.src || '',
          "description": (product.short_description || '').replace(/(<([^>]+)>)/gi, ''),
          "offers": {
            "@type": "Offer",
            "priceCurrency": "EUR",
            "price": parseFloat(product.price).toString(),
            "availability": "https://schema.org/InStock",
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "shippingDetails": [
              {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": "3.80",
                  "currency": "EUR"
                },
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "SK"
                },
                "deliveryTime": {
                  "@type": "ShippingDeliveryTime",
                  "handlingTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 0,
                    "maxValue": 1,
                    "unitCode": "DAY"
                  },
                  "transitTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 2,
                    "unitCode": "DAY"
                  }
                }
              },
              {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": "2.90",
                  "currency": "EUR"
                },
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "SK"
                },
                "deliveryTime": {
                  "@type": "ShippingDeliveryTime",
                  "handlingTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 0,
                    "maxValue": 1,
                    "unitCode": "DAY"
                  },
                  "transitTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 2,
                    "unitCode": "DAY"
                  }
                }
              }
            ],
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "SK",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 14,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/ReturnShippingFees",
              "returnShippingFeesAmount": {
                "@type": "MonetaryAmount",
                "value": "3.80",
                "currency": "EUR"
              }
            },
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
