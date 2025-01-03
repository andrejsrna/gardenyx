import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vitamín C | Zloženie JointBoost',
  description: 'Vitamín C, známy aj ako kyselina askorbová, je nevyhnutný vitamín s mnohými dôležitými funkčnými účinkami v ľudskom tele.',
};

export default function VitaminCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 