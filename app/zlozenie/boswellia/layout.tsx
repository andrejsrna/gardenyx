import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Boswellia Serata | Zloženie JointBoost',
  description: 'Boswellia serrata, známa tiež ako indická kadidlovnica, je rastlina tradične používaná v ajurvédskej medicíne. Je známa pre svoje protizápalové a analgetické účinky.',
  path: '/zlozenie/boswellia',
});

export default function BoswelliaSerataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
