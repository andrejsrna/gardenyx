const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';

export default function OrganizationSchema() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GardenYX',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Slovak', 'Czech', 'Hungarian'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SK',
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61575962272009',
    ],
    description: 'GardenYX — záhradnícke produkty a hnojivá pre zdravé rastliny. Predaj na Slovensku, v Česku a Maďarsku.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
