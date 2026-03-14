import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Glukozamín | Zloženie JointBoost',
  description: 'Glukozamín je prirodzená látka nachádzajúca sa v zdravej chrupavke. Podporuje zdravie kĺbov a pomáha pri osteoartritíde.',
  path: '/zlozenie/glukozamin',
});

export default function GlucosaminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
