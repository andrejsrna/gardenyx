import { Metadata } from 'next';
import { buildStaticMetadata } from '../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Obchodné podmienky | JointBoost',
  description: 'Obchodné podmienky internetového obchodu najsilnejsiaklbovavyziva.sk',
  path: '/obchodne-podmienky',
});

export default function ObchodnePodmienkyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
