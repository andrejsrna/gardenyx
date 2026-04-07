import { setRequestLocale } from 'next-intl/server';
import AppDownloadSection from '../components/AppDownloadSection';
import HomeHero from '../components/HomeHero';
import HomeLatestProducts from '../components/HomeLatestProducts';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <HomeHero locale={locale} />
      <HomeLatestProducts locale={locale} />
      <AppDownloadSection locale={locale} />
    </main>
  );
}
