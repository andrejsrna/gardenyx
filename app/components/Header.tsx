'use client';

import { Menu, User as UserIcon, X, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartButton from './CartButton';
import { safeGetItem } from '../lib/utils/safe-local-storage';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '../../i18n/navigation';

const LOCALES = [
  { code: 'sk', label: 'SK', name: 'Slovenčina' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hu', label: 'HU', name: 'Magyar' },
];

function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    router.push(pathname, { locale: newLocale });
    setOpen(false);
  }

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
        aria-label="Zmeniť jazyk"
      >
        <Globe className="w-4 h-4" />
        <span>{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-emerald-100/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl z-50">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-emerald-50 hover:text-emerald-700 ${
                l.code === locale ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
              }`}
            >
              <span className="font-semibold w-6">{l.label}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const { customerData, isLoading } = useAuth();
  const { closeCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_LINKS = [
    { title: t('shop'), href: '/kupit' },
    { title: t('hakofytFertilizers'), href: '/hnojiva-hakofyt' },
    { title: t('contact'), href: '/kontakt' },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const customerName = customerData?.billing?.first_name || customerData?.first_name || safeGetItem('customerName') || '';

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent"
      />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 transition-all">
          <Link href="/" className="relative z-10 flex items-center">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">GardenYX</span>
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full transition-all duration-200 hover:text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <Link
              href="/moj-ucet"
              className="group relative flex items-center gap-2 rounded-full bg-white/40 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-emerald-700 hover:shadow-[0_10px_30px_-18px_rgba(16,185,129,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
              title={customerData ? `${t('hello', { name: customerName })}` : t('myAccount')}
            >
              {isLoading ? (
                <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full" />
              ) : customerData ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    <UserIcon className="w-4 h-4" />
                    <span>{t('hello', { name: customerName })}</span>
                  </div>
                  <UserIcon className="w-6 h-6 md:hidden" />
                </>
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
            </Link>
            <CartButton />

            <button
              className="rounded-full bg-white/70 p-2 shadow-sm ring-1 ring-emerald-100 transition-all duration-200 hover:bg-white lg:hidden"
              onClick={() => {
                closeCart();
                setIsMobileMenuOpen(true);
              }}
              aria-label="Otvoriť menu"
            >
              <Menu className="w-6 h-6 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex min-h-screen flex-col bg-gradient-to-b from-white via-white to-emerald-50 lg:hidden">
          <div className="container mx-auto px-4">
            <div className="flex h-20 items-center justify-between">
              <Link href="/" className="relative" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-2xl font-bold tracking-tight text-emerald-700">GardenYX</span>
              </Link>
              <div className="flex items-center gap-3">
                <LanguageSwitcher locale={locale} />
                <Link
                  href="/moj-ucet"
                  className="group relative flex items-center gap-2 rounded-full bg-white/70 p-2 text-slate-600 transition-all hover:text-emerald-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isLoading ? (
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </Link>
                <CartButton />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Zavrieť menu"
                  className="rounded-full bg-white/70 p-2 text-emerald-600 shadow-sm ring-1 ring-emerald-100 transition-all duration-200 hover:bg-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="container mx-auto flex flex-col gap-2 px-4 pb-12">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl bg-white/70 px-4 py-3 text-lg font-semibold text-slate-700 shadow-sm ring-1 ring-emerald-100 transition-all hover:bg-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
