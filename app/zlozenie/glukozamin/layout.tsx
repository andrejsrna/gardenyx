import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glukozamín | Zloženie JointBoost',
  description: 'Glukozamín je prirodzená látka nachádzajúca sa v zdravej chrupavke. Podporuje zdravie kĺbov a pomáha pri osteoartritíde.',
};

export default function GlucosaminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 