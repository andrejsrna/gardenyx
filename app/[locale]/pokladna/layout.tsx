import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type CheckoutLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const localeToOgLocale: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  hu: 'hu_HU',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout.meta' });
  const path = locale === 'en' ? '/en/checkout' : locale === 'hu' ? '/hu/penztar' : '/sk/pokladna';

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://gardenyx.eu${path}`,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://gardenyx.eu${path}`,
      siteName: 'GardenYX',
      locale: localeToOgLocale[locale] ?? localeToOgLocale.sk,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    other: {
      'format-detection': 'telephone=no',
    }
  };
}

export default function CheckoutLayout({
  children,
}: CheckoutLayoutProps) {
  return children;
}
