import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ochrana osobných údajov | JointBoost',
  description: 'Informácie o ochrane osobných údajov a spôsobe spracovania vašich údajov na stránke najsilnejsiaklbovavyziva.sk',
};

export default function OchranaOsobnychUdajovLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 