import { Metadata } from 'next';

type LocaleContent = {
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  body: string;
};

const contentByLocale: Record<string, LocaleContent> = {
  sk: {
    metadataTitle: 'Ochrana osobných údajov | GardenYX',
    metadataDescription:
      'Zásady ochrany osobných údajov GardenYX pre e-shop vrátane rozsahu spracúvania údajov a vašich práv.',
    title: 'Zásady ochrany osobných údajov',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Dátum účinnosti: 6. marca 2026',
    body: `
      <p>Obsah zásad ochrany osobných údajov bude čoskoro doplnený.</p>
    `,
  },
  en: {
    metadataTitle: 'Privacy Policy | GardenYX',
    metadataDescription:
      'GardenYX privacy policy for the e-shop, including data processing details and your rights.',
    title: 'Privacy Policy',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Effective Date: March 6, 2026',
    body: `
      <p>Privacy policy content will be added soon.</p>
    `,
  },
  hu: {
    metadataTitle: 'Adatvédelmi irányelvek | GardenYX',
    metadataDescription:
      'A GardenYX adatvédelmi irányelvei a webshophoz, az adatkezelés részleteivel és az Ön jogaival.',
    title: 'Adatvédelmi irányelvek',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Hatálybalépés dátuma: 2026. március 6.',
    body: `
      <p>Az adatvédelmi irányelvek tartalma hamarosan elérhető lesz.</p>
    `,
  },
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

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = contentByLocale[locale] ?? contentByLocale.sk;

  return (
    <main className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12">
            <p className="text-xs uppercase tracking-widest text-stone-400">{content.subtitle}</p>
            <h1 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">{content.title}</h1>
            <p className="mt-2 text-sm text-stone-500">{content.effectiveDate}</p>
            <div
              className="prose prose-stone mt-8 max-w-none"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
