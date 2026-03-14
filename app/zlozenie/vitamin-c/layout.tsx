import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Vitamín C | Zloženie JointBoost',
  description: 'Vitamín C, známy aj ako kyselina askorbová, je nevyhnutný vitamín s mnohými dôležitými funkčnými účinkami v ľudskom tele.',
  path: '/zlozenie/vitamin-c',
});

export default function VitaminCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
