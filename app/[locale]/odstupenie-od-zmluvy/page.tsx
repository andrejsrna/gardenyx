import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import WithdrawalForm from './WithdrawalForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'withdrawalPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function WithdrawalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WithdrawalForm />;
}
