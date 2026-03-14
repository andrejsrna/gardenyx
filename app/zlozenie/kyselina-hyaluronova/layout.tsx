import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Kyselina hyaluronová | Zloženie JointBoost',
  description: 'Kyselina hyaluronová je prirodzene sa vyskytujúca látka v ľudskom tele, známa pre svoju schopnosť udržiavať vlhkosť a podporovať zdravie kĺbov.',
  path: '/zlozenie/kyselina-hyaluronova',
});

export default function KyselinaHyaluronovaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
