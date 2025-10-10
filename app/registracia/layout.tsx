import { Metadata } from 'next';

// Force dynamic rendering - this page needs cookies/session
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Registrácia | Najsilnejšia kĺbová výživa',
  description: 'Vytvorte si účet a získajte prístup k svojim objednávkam.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://najsilnejsiaklbovavyziva.sk/registracia',
  },
};

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
