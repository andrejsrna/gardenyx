const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.gardenyx.eu';

export default function OrganizationSchema() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GardenYX',
    alternateName: 'JOINA Garden, s. r. o.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo_gardenyx.png`,
    },
    email: 'support@gardenyx.eu',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@gardenyx.eu',
      contactType: 'Customer Service',
      availableLanguage: ['Slovak', 'Czech', 'Hungarian'],
      areaServed: ['SK', 'CZ', 'HU'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Karpatské námestie 7770/10A',
      addressLocality: 'Bratislava',
      addressRegion: 'Rača',
      postalCode: '831 06',
      addressCountry: 'SK',
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'IČO',
      value: '57313504',
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
