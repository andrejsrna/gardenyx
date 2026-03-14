import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'MSM prášok | Zloženie JointBoost',
  description: 'MSM (metylsulfonylmetán) je organická zlúčenina síry, ktorá sa často používa ako doplnok stravy, predovšetkým pre jej potenciálne prínosy pre zdravie kĺbov.',
  path: '/zlozenie/msm',
});

export default function MsmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
