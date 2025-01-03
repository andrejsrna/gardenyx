import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kolagén | Zloženie JointBoost',
  description: 'Kolagén je najhojnejší proteín v ľudskom tele, dôležitý pre mnohé aspekty nášho zdravia.',
};

export default function KolagenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 