import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | NKV',
  description: 'Interné náhľady na obsah a objednávky.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="text-sm font-semibold text-white">NKV Admin</div>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/newsletter"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Newsletter
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Objednávky
            </Link>
            <Link
              href="/admin/reviews"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Recenzie
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Nastavenia
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
