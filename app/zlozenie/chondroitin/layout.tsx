import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Chondroitín | Zloženie JointBoost',
  description: 'Chondroitín je ďalšou prirodzene sa vyskytujúcou látkou v kĺbovej chrupavke, ktorá je často používaná v doplnkoch na podporu zdravia kĺbov, najmä u ľudí s osteoartritídou.',
  path: '/zlozenie/chondroitin',
});

export default function ChondroitinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
