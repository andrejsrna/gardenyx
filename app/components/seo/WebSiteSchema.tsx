export default function WebSiteSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Najsilnejšia kĺbová výživa",
    "url": "https://najsilnejsiaklbovavyziva.sk",
    "description": "Najsilnejšia prírodná kĺbová výživa na Slovensku. Špecializujeme sa na prírodné doplnky stravy pre zdravé kĺby s kurkumínom, boswelliou a ďalšími účinnými látkami.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://najsilnejsiaklbovavyziva.sk/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
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