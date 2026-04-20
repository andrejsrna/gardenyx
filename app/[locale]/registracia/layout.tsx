import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Registrácia | GardenYX',
  description: 'Vytvorte si účet a získajte prístup k svojim objednávkam.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
