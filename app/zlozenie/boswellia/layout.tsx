import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Boswellia Serata | Zloženie JointBoost',
  description: 'Boswellia serrata, známa tiež ako indická kadidlovnica, je rastlina tradične používaná v ajurvédskej medicíne. Je známa pre svoje protizápalové a analgetické účinky.',
};

export default function BoswelliaSerataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 