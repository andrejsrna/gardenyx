import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MSM prášok | Zloženie JointBoost',
  description: 'MSM (metylsulfonylmetán) je organická zlúčenina síry, ktorá sa často používa ako doplnok stravy, predovšetkým pre jej potenciálne prínosy pre zdravie kĺbov.',
};

export default function MsmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 