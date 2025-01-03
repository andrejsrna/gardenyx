import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chondroitín | Zloženie JointBoost',
  description: 'Chondroitín je ďalšou prirodzene sa vyskytujúcou látkou v kĺbovej chrupavke, ktorá je často používaná v doplnkoch na podporu zdravia kĺbov, najmä u ľudí s osteoartritídou.',
};

export default function ChondroitinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 