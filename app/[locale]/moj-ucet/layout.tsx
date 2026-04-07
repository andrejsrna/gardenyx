import type { Metadata } from 'next';

// Force dynamic rendering - this page needs authentication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


