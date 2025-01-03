import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obchodné podmienky | JointBoost',
  description: 'Obchodné podmienky internetového obchodu najsilnejsiaklbovavyziva.sk',
};

export default function ObchodnePodmienkyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 