import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doprava a platba | JointBoost',
  description: 'Informácie o možnostiach dopravy a platby. Pri nákupe 3 a viac balení máte dopravu zadarmo.',
};

export default function DopravaAPlatbaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 