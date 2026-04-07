import { Metadata } from 'next';
import LegalDocumentTabs from '../obchodne-podmienky/LegalDocumentTabs';

type PrivacyContent = {
  metadataTitle: string;
  metadataDescription: string;
  label: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  appLabel: string;
  appTitle: string;
  appSubtitle: string;
  appEffectiveDate: string;
  shopTabLabel: string;
  appTabLabel: string;
};

const contentByLocale: Record<string, PrivacyContent> = {
  sk: {
    metadataTitle: 'Ochrana osobných údajov | GardenYX',
    metadataDescription:
      'Zásady ochrany osobných údajov GardenYX pre e-shop aj mobilnú aplikáciu vrátane rozsahu spracúvania údajov a vašich práv.',
    label: 'Zásady ochrany osobných údajov e-shopu',
    title: 'Zásady ochrany osobných údajov',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Dátum účinnosti: 6. marca 2026',
    appLabel: 'Zásady ochrany osobných údajov aplikácie',
    appTitle: 'Zásady ochrany osobných údajov',
    appSubtitle: 'Mobilná aplikácia',
    appEffectiveDate: 'Dátum účinnosti: 6. marca 2026',
    shopTabLabel: 'E-shop',
    appTabLabel: 'Aplikácia',
  },
  en: {
    metadataTitle: 'Privacy Policy | GardenYX',
    metadataDescription:
      'GardenYX privacy policy for both the e-shop and mobile app, including data processing details and your rights.',
    label: 'E-shop Privacy Policy',
    title: 'Privacy Policy',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Effective Date: March 6, 2026',
    appLabel: 'App Privacy Policy',
    appTitle: 'Privacy Policy',
    appSubtitle: 'Mobile Application',
    appEffectiveDate: 'Effective Date: March 6, 2026',
    shopTabLabel: 'E-shop',
    appTabLabel: 'App',
  },
  hu: {
    metadataTitle: 'Adatvédelmi irányelvek | GardenYX',
    metadataDescription:
      'A GardenYX adatvédelmi irányelvei a webshophoz és a mobilalkalmazáshoz, az adatkezelés részleteivel és az Ön jogaival.',
    label: 'Az e-shop adatvédelmi irányelvei',
    title: 'Adatvédelmi irányelvek',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Hatálybalépés dátuma: 2026. március 6.',
    appLabel: 'Az alkalmazás adatvédelmi irányelvei',
    appTitle: 'Adatvédelmi irányelvek',
    appSubtitle: 'Mobilalkalmazás',
    appEffectiveDate: 'Hatályba lépés: 2026. március 6.',
    shopTabLabel: 'E-shop',
    appTabLabel: 'Alkalmazás',
  },
};

const sourceUrls: Record<string, string> = {
  sk: 'https://gardenyx.eu/pages/privacy-policy',
  en: 'https://gardenyx.eu/en/pages/privacy-policy',
  hu: 'https://gardenyx.eu/hu/pages/privacy-policy',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = contentByLocale[locale] ?? contentByLocale.sk;

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
  };
}

function extractSection(html: string, key: 'shop' | 'app') {
  const safeKey = key === 'app' ? 'app' : 'shop';
  const regex = new RegExp(
    `<section\\s+id="LegalDocumentPanel-${safeKey}[^"]*"[^>]*>[\\s\\S]*?<div class="legal-document__body rte">([\\s\\S]*?)<\\/div>\\s*<\\/article>\\s*<\\/section>`,
    'i'
  );

  const match = html.match(regex);

  if (!match?.[1]) {
    throw new Error(`Could not extract ${safeKey} privacy policy section`);
  }

  return match[1].trim();
}

async function fetchPrivacySections(locale: string) {
  const sourceUrl = sourceUrls[locale] ?? sourceUrls.sk;
  const response = await fetch(sourceUrl, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch privacy policy source: ${response.status}`);
  }

  const html = await response.text();

  return {
    shop: extractSection(html, 'shop'),
    app: extractSection(html, 'app'),
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = contentByLocale[locale] ?? contentByLocale.sk;
  const sections = await fetchPrivacySections(locale);

  return (
    <main className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <LegalDocumentTabs
            sections={[
              {
                key: 'shop',
                tabLabel: content.shopTabLabel,
                label: content.label,
                title: content.title,
                subtitle: content.subtitle,
                effectiveDate: content.effectiveDate,
                bodyHtml: sections.shop,
              },
              {
                key: 'app',
                tabLabel: content.appTabLabel,
                label: content.appLabel,
                title: content.appTitle,
                subtitle: content.appSubtitle,
                effectiveDate: content.appEffectiveDate,
                bodyHtml: sections.app,
              },
            ]}
          />
        </article>
      </div>
    </main>
  );
}
