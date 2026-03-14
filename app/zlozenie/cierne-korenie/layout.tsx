import { Metadata } from 'next';
import { buildStaticMetadata } from '../../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Extrakt z čierneho korenia | Zloženie JointBoost',
  description: 'Extrakt z čierneho korenia, známy tiež ako piperín, je bioaktívna zložka, ktorá sa nachádza v čiernom korení. Piperín je známy pre svoje rôzne zdravotné prínosy a schopnosť zvyšovať absorpciu iných látok.',
  path: '/zlozenie/cierne-korenie',
});

export default function CierneKorenieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
