import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Kurkuma | Zloženie JointBoost',
  description: 'Kurkuma, známa pre svoju aktívnu zložku kurkumín, je často ospevovaná pre jej potenciálne prínosy pre zdravie, najmä v oblasti podpory zdravia kĺbov.',
  path: '/zlozenie/kurkuma',
});

export default function KurkumaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
