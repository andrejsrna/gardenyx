import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kyselina hyaluronová | Zloženie JointBoost',
  description: 'Kyselina hyaluronová je prirodzene sa vyskytujúca látka v ľudskom tele, známa pre svoju schopnosť udržiavať vlhkosť a podporovať zdravie kĺbov.',
};

export default function KyselinaHyaluronovaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 