import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Extrakt z čierneho korenia | Zloženie JointBoost',
  description: 'Extrakt z čierneho korenia, známy tiež ako piperín, je bioaktívna zložka, ktorá sa nachádza v čiernom korení. Piperín je známy pre svoje rôzne zdravotné prínosy a schopnosť zvyšovať absorpciu iných látok.',
};

export default function CierneKorenieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 