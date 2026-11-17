import type { Metadata } from 'next';
import RestoreCart from './RestoreCart';

export const metadata: Metadata = { title: 'GardenYX', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  return <RestoreCart token={token} locale={locale} />;
}
