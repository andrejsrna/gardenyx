import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Boswellia serrata | Zloženie JointBoost',
  description: 'Boswellia serrata je známa svojimi protizápalovými účinkami a podporou pohyblivosti kĺbov. Zistite, prečo je dôležitou súčasťou JointBoostu.',
  path: '/zlozenie/boswellia-serata',
});

export default function BoswelliaSerataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
