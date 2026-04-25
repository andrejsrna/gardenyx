import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllProducts } from '../lib/products';
import ProductShowcaseSection from './ProductShowcaseSection';

export default async function HomeLatestProducts({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'homeLatestProducts' });
  const products = (await getAllProducts(locale))
    .sort((a, b) => b.wcId - a.wcId)
    .slice(0, 4);

  return (
    <ProductShowcaseSection
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      detailLabel={t('detail')}
      products={products}
      cta={{ href: '/kupit', label: t('viewAll') }}
    />
  );
}
