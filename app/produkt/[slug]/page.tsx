import { getWooCommerceUrl, WooCommerceProduct } from '@/app/lib/wordpress';
import AddToCartButton from './AddToCartButton';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import ProductSchema from '@/app/components/seo/ProductSchema';

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

  const hasDiscount = product.sale_price !== '';
  const price = parseFloat(product.price);
  const regularPrice = parseFloat(product.regular_price);
  const discount = hasDiscount ? Math.round((1 - price / regularPrice) * 100) : 0;

  const benefits = [
    'Doprava zadarmo nad 40€',
    'Expresné doručenie do 24h',
    'Bezpečný nákup',
    '14 dní na vrátenie'
  ];

  return (
    <>
      <ProductSchema product={product} />
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Column - Image */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-white p-8 flex items-center justify-center">
              {product.images[0] && (
                <div className="relative w-full h-full max-w-lg mx-auto">
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.name}
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
            <div className="p-8 lg:p-12 flex flex-col h-full">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-green-600">
                    {price.toFixed(2)} €
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through">
                      {regularPrice.toFixed(2)} €
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Ušetríte {((regularPrice - price)).toFixed(2)} €
                    </span>
                  )}
                </div>

                <div 
                  className="prose prose-lg prose-green mb-8"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <AddToCartButton product={product} />
                
                <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                  Bezpečná platba kartou alebo prevodom
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-8 lg:p-12">
          <h2 className="text-2xl font-bold mb-6">Popis produktu</h2>
          <div 
            className="prose prose-lg max-w-none prose-green"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
    </div>
    </>
  );
} 