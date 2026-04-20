const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';

export default function WebSiteSchema() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GardenYX',
    url: SITE_URL,
    description: 'GardenYX — záhradnícke produkty a hnojivá pre zdravé rastliny. Predaj na Slovensku, v Česku a Maďarsku.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/kupit?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GardenYX',
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
