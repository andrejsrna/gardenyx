import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import AppDownloadSection from '../../components/AppDownloadSection';

const metadataByLocale = {
  sk: {
    title: 'Stiahnuť aplikáciu | GardenYX',
    description:
      'Stiahnite si aplikáciu GardenYX a majte starostlivosť o záhradu stále po ruke.',
  },
  en: {
    title: 'Download the App | GardenYX',
    description:
      'Download the GardenYX app and keep garden care within reach at all times.',
  },
  hu: {
    title: 'Alkalmazás letöltése | GardenYX',
    description:
      'Töltse le a GardenYX alkalmazást, és tartsa mindig kéznél a kert gondozását.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metadata = metadataByLocale[locale as keyof typeof metadataByLocale] ?? metadataByLocale.sk;

  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <AppDownloadSection locale={locale} />
    </main>
  );
}
