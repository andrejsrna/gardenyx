import { Metadata } from 'next';
import { buildStaticMetadata } from '../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Doprava a platba | JointBoost',
  description: 'Informácie o možnostiach dopravy a platby. Pri nákupe 3 a viac balení máte dopravu zadarmo.',
  path: '/doprava-a-platba',
});

export default function DopravaAPlatbaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
