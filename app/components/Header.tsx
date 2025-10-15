'use client';

import { ChevronDown, Menu, User as UserIcon, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CartButton from './CartButton';

const INGREDIENTS_SUBMENU = [
  { title: 'Glukozamín', href: '/zlozenie/glukozamin' },
  { title: 'Chondroitín', href: '/zlozenie/chondroitin' },
  { title: 'MSM', href: '/zlozenie/msm' },
  { title: 'Vitamín C', href: '/zlozenie/vitamin-c' },
  { title: 'Kolagén', href: '/zlozenie/kolagen' },
  { title: 'Kurkuma', href: '/zlozenie/kurkuma' },
  { title: 'Čierne korenie', href: '/zlozenie/cierne-korenie' },
  { title: 'Kyselina hyaluronová', href: '/zlozenie/kyselina-hyaluronova' },
  { title: 'Boswellia', href: '/zlozenie/boswellia' },
];

const PRIMARY_LINKS = [
  { title: 'Joint Boost', href: '/joint-boost' },
  { title: 'Často kladené otázky', href: '/casto-kladene-otazky' },
  { title: 'Užívanie', href: '/uzivanie' },
];

const SECONDARY_LINKS = [
  { title: 'Blog', href: '/blog' },
  { title: 'Kontakt', href: '/kontakt' },
];

export default function Header() {
  const { customerData, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [customerName, setCustomerName] = useState<string>('používateľ');

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (customerData) {
      const firstName = customerData.billing?.first_name || customerData.first_name || localStorage.getItem('customerName') || 'používateľ';
      setCustomerName(firstName);
    }
  }, [customerData]);

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent"
      />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 transition-all">
          <Link href="/" className="relative z-10 flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={40}
              priority={true}
              style={{ height: '40px', width: '150px', objectFit: 'contain' }}
              className="w-auto"
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-2">
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full transition-all duration-200 hover:text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
              >
                {item.title}
              </Link>
            ))}
            <div className="relative group">
              <Link
                href="/zlozenie"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 rounded-full transition-all duration-200 hover:text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
              >
                <span>Zloženie</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:-rotate-180" />
              </Link>
              <div className="invisible absolute left-0 top-full z-50 mt-2 w-64 translate-y-1 rounded-2xl border border-emerald-100/80 bg-white/95 p-2 opacity-0 shadow-xl ring-1 ring-emerald-200/40 backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex flex-col gap-1">
                  {INGREDIENTS_SUBMENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {SECONDARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full transition-all duration-200 hover:text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/kupit"
              className="group relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-emerald-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative">Naše produkty</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/moj-ucet"
              className="group relative flex items-center gap-2 rounded-full bg-white/40 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-emerald-700 hover:shadow-[0_10px_30px_-18px_rgba(16,185,129,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
              title={customerData ? `Prihlásený ako ${customerData.first_name || customerData.billing?.first_name}` : "Môj účet"}
            >
              {isLoading ? (
                <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full" />
              ) : customerData ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    <UserIcon className="w-4 h-4" />
                    <span>
                      Ahoj {customerName}
                    </span>
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
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Otvoriť menu"
            >
              <Menu className="w-6 h-6 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-white via-white to-emerald-50 lg:hidden">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="relative" onClick={() => setIsMobileMenuOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={150}
                  height={40}
                  style={{ height: '40px', width: '150px', objectFit: 'contain' }}
                  className="w-auto"
                />
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/moj-ucet"
                  className="group relative flex items-center gap-2 rounded-full bg-white/70 p-2 text-slate-600 transition-all hover:text-emerald-700"
                  title={customerData ? `Prihlásený ako ${customerData.first_name || customerData.billing?.first_name}` : "Môj účet"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full" />
                  ) : customerData ? (
                    <UserIcon className="w-6 h-6" />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                </Link>
                <CartButton />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Zavrieť menu"
                  className="rounded-full bg-white/70 p-2 text-emerald-600 shadow-sm ring-1 ring-emerald-100 transition-all duration-200 hover:bg-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="pb-12">
              <nav className="flex flex-col gap-2">
                {PRIMARY_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl bg-white/70 px-4 py-3 text-lg font-semibold text-slate-700 shadow-sm ring-1 ring-emerald-100 transition-all hover:bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-emerald-100">
                  <button
                    className="flex w-full items-center justify-between text-lg font-semibold text-slate-700"
                    onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
                  >
                    Zloženie
                    <ChevronDown className={`w-5 h-5 transition-transform ${isIngredientsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isIngredientsOpen && (
                    <div className="mt-3 space-y-2 border-t border-emerald-100 pt-3">
                      <Link
                        href="/zlozenie"
                        className="block rounded-xl px-3 py-2 text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Všetky zložky
                      </Link>
                      {INGREDIENTS_SUBMENU.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-xl px-3 py-2 text-base font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {SECONDARY_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl bg-white/70 px-4 py-3 text-lg font-semibold text-slate-700 shadow-sm ring-1 ring-emerald-100 transition-all hover:bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
                <Link
                  href="/kupit"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-200/50 transition-transform duration-200 hover:-translate-y-0.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Naše produkty
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
