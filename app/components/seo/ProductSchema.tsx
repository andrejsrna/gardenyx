import { Product } from '@/app/lib/content-types';

interface ProductSchemaProps {
  product: Product;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';
const SHIPPING_COUNTRIES = ['SK', 'CZ', 'HU'] as const;

function makeShipping(country: string) {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: '3.50',
      currency: 'EUR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: country,
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 1,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY',
      },
    },
  };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const price = parseFloat(product.price);
  const inStock = product.stock_status !== 'outofstock';
  const priceValidUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: (product.short_description || product.description || '').replace(/(<([^>]+)>)/gi, '').trim(),
    sku: product.sku || product.id.toString(),
    brand: {
      '@type': 'Brand',
      name: 'GardenYX',
    },
    category: product.categories[0]?.name || 'Záhradnícke produkty',
    image: product.images.map((img) => img.src),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produkt/${product.slug}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil,
      shippingDetails: SHIPPING_COUNTRIES.map(makeShipping),
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: SHIPPING_COUNTRIES,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      seller: {
        '@type': 'Organization',
        name: 'GardenYX',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
