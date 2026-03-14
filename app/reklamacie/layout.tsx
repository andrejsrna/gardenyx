import { Metadata } from 'next';
import { buildStaticMetadata } from '../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Reklamácie a vrátenie tovaru | JointBoost',
  description: 'Informácie o možnostiach reklamácie a vrátenia tovaru. Garantujeme možnosť vrátenia tovaru do 14 dní.',
  path: '/reklamacie',
});

export default function ReklamacieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
