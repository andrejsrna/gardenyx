import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pokladňa | Najsilnejšia kĺbová výživa',
  description: 'Dokončite svoju objednávku kĺbovej výživy.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://najsilnejsiaklbovavyziva.sk/pokladna',
  },
  openGraph: {
    title: 'Pokladňa | Najsilnejšia kĺbová výživa',
    description: 'Dokončite svoju objednávku kĺbovej výživy.',
    url: 'https://najsilnejsiaklbovavyziva.sk/pokladna',
    siteName: 'Najsilnejšia kĺbová výživa',
    locale: 'sk_SK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokladňa | Najsilnejšia kĺbová výživa',
    description: 'Dokončite svoju objednávku kĺbovej výživy.',
  },
  other: {
    'format-detection': 'telephone=no',
  }
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 