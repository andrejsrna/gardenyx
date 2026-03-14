export default function OrganizationSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Najsilnejšia kĺbová výživa",
    "url": "https://najsilnejsiaklbovavyziva.sk",
    "logo": "https://najsilnejsiaklbovavyziva.sk/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+421-914-230-321",
      "contactType": "Customer Service",
      "availableLanguage": ["Slovak"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SK",
      "addressLocality": "Slovensko"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61575962272009"
    ],
    "description": "Najsilnejšia prírodná kĺbová výživa na Slovensku. Špecializujeme sa na prírodné doplnky stravy pre zdravé kĺby s kurkumínom, boswelliou a ďalšími účinnými látkami."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 
