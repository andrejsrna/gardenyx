import { Metadata } from 'next';
import { buildStaticMetadata } from '../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Ochrana osobných údajov | JointBoost',
  description: 'Informácie o ochrane osobných údajov a spôsobe spracovania vašich údajov na stránke najsilnejsiaklbovavyziva.sk',
  path: '/ochrana-osobnych-udajov',
});

export default function OchranaOsobnychUdajovLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
