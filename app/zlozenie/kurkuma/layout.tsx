import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kurkuma | Zloženie JointBoost',
  description: 'Kurkuma, známa pre svoju aktívnu zložku kurkumín, je často ospevovaná pre jej potenciálne prínosy pre zdravie, najmä v oblasti podpory zdravia kĺbov.',
};

export default function KurkumaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 