import { getWooCommerceUrl, WooCommerceProduct, getMediaDetails } from '@/app/lib/wordpress';
import AddToCartButton from './AddToCartButton';
import ProductTracking from './ProductTracking';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle, CreditCard } from 'lucide-react';
import ProductSchema from '@/app/components/seo/ProductSchema';
import Composition from '@/app/components/Composition';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Produkt nenájdený',
    };
  }



  const cleanDescription = product.short_description.replace(/(<([^>]+)>)/gi, '');
  const price = parseFloat(product.price);
  const hasDiscount = product.sale_price !== '';
  
  return {
    title: `${product.name} | Najsilnejšia kĺbová výživa`,
    description: cleanDescription,
    keywords: ['kĺbová výživa', 'kolagén', 'glukozamín', 'chondroitín', 'MSM', product.name],
    openGraph: {
      title: `${product.name} | Najsilnejšia kĺbová výživa`,
      description: cleanDescription,
      type: 'website' as const,
      images: product.images.map((img: WooCommerceProduct['images'][number]) => ({
        url: img.src,
        alt: img.alt || product.name,
        width: 800,
        height: 800,
      })),
      locale: 'sk_SK',
      siteName: 'Najsilnejšia kĺbová výživa',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Najsilnejšia kĺbová výživa`,
      description: cleanDescription,
      images: product.images[0]?.src ? [product.images[0].src] : [],
    },
    alternates: {
      canonical: `https://najsilnejsiaklbovavyziva.sk/produkt/${product.slug}`,
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'EUR',
      'product:availability': 'in stock',
      ...(hasDiscount && {
        'product:sale_price_dates:start': new Date().toISOString().split('T')[0],
        'product:sale_price_dates:end': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    },
  };
}

async function getProduct(slug: string) {
  try {
    const response = await fetch(getWooCommerceUrl('products', { slug }), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const products = await response.json();
    return products[0]; // WooCommerce returns an array, we want the first item
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const mediaDetails = await getMediaDetails(product.images[0]?.id);
  const imageUrl = mediaDetails?.source_url || product.images[0]?.src;

  const hasDiscount = product.sale_price !== '';
  const price = parseFloat(product.price);
  const regularPrice = parseFloat(product.regular_price);
  const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;

  const benefits = [
    'Doprava zadarmo nad 39€',
    'Expresné doručenie do 48h',
    'Bezpečný nákup',
    '14 dní na vrátenie'
  ];

const showComposition = ['Najsilnejšia kĺbová výživa', 'Najsilnejšej kĺbovej výživy', 'Joint Boost', 'JointBoost'].some(name => 
  product.name.includes(name)
);

  return (
    <>
      <ProductSchema product={product} />
      <ProductTracking product={product} />
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Left Column - Image */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-white p-8 flex items-center justify-center">
              {imageUrl && (
                <div className="relative w-full h-full mx-auto">
                  <Image
                    src={imageUrl}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-6 right-6 bg-green-600 text-white px-4 py-2 rounded-full text-lg font-semibold shadow-lg">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="p-8 lg:p-12 flex flex-col h-full md:col-span-2">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-4xl font-bold text-gray-800">
                    {price.toFixed(2)} €
                  </span>
                  {hasDiscount && (
                    <span className="text-2xl text-gray-400 line-through">
                      {regularPrice.toFixed(2)} €
                    </span>
                  )}
                </div>

                <div 
                  className="prose prose-lg prose-green mb-8"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              </div>

              <div className="mt-auto space-y-6">
                <AddToCartButton product={product} />

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="p-4 bg-green-50/50 rounded-lg border border-green-200/60">
                    <div className="flex items-center gap-3">
                      <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path d="M0 0H24V18H0V0Z" fill="white"/>
                        <path d="M0 6H24V18H0V6Z" fill="#0D5EAF"/>
                        <path d="M0 12H24V18H0V12Z" fill="#D72828"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.7909 9.00002C12.7909 10.2801 11.7779 11.2941 10.5 11.2941C9.22213 11.2941 8.20911 10.2801 8.20911 9.00002C8.20911 7.71992 9.22213 6.70593 10.5 6.70593C11.7779 6.70593 12.7909 7.71992 12.7909 9.00002ZM6.38184 14.1177V9.64708C6.38184 9.64708 6.91366 7.23532 7.74548 6.1765C8.5773 5.11768 10.5 3.52944 10.5 3.52944C10.5 3.52944 12.4227 5.11768 13.2545 6.1765C14.0864 7.23532 14.6182 9.64708 14.6182 9.64708V14.1177H6.38184Z" fill="white" stroke="#D72828" strokeWidth="0.7"/>
                        <path d="M10.5 9.00002C10.5 9.1768 10.3305 9.32355 10.1136 9.32355V10.1471C10.7955 10.1471 11.3455 9.62355 11.3455 9.00002H10.5Z" fill="#0D5EAF"/>
                        <path d="M10.8864 8.67649C10.8864 8.85327 10.7168 9.00002 10.5 9.00002V9.82355C11.1818 9.82355 11.7318 9.30002 11.7318 8.67649H10.8864Z" fill="#0D5EAF"/>
                      </svg>
                      <p className="font-semibold text-green-800 text-base">
                        Najsilnejšia kĺbová výživa je <span className="font-bold">slovenský produkt</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Platba kartou alebo na dobierku</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {!showComposition && product.description && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-8 lg:p-12">
            <h2 className="text-2xl font-bold mb-6">Popis produktu</h2>
            <div 
              className="prose prose-lg max-w-none prose-green"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {showComposition && <Composition />}
      </div>
    </div>
    </>
  );
} 