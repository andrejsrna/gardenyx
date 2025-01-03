import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reklamácie a vrátenie tovaru | JointBoost',
  description: 'Informácie o možnostiach reklamácie a vrátenia tovaru. Garantujeme možnosť vrátenia tovaru do 14 dní.',
};

export default function ReklamacieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 