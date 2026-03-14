import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Kolagén | Zloženie JointBoost',
  description: 'Kolagén je najhojnejší proteín v ľudskom tele, dôležitý pre mnohé aspekty nášho zdravia.',
  path: '/zlozenie/kolagen',
});

export default function KolagenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
