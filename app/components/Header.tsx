'use client';

import Link from 'next/link';
import CartButton from './CartButton';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Menu, X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="relative z-10">
            <Image 
              src="/logo.png"
              alt="Logo"
              width={150}
              height={40}
              priority={true}
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/casto-kladene-otazky" 
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Často kladené otázky
            </Link>
            <Link 
              href="/uzivanie" 
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Užívanie
            </Link>
            <div className="relative group">
              <button 
                className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
              >
                <Link 
                  href="/zlozenie" 
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Zloženie
                </Link>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block">
                <div className="py-2 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 w-64">
                  {INGREDIENTS_SUBMENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link 
              href="/blog" 
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/kontakt" 
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Kontakt
            </Link>
            <Link 
              href="/kupit" 
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Kúpiť teraz
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/moj-ucet" 
              className="group relative flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
              title={customerData ? `Prihlásený ako ${customerData.first_name || customerData.billing?.first_name}` : "Môj účet"}
            >
              {isLoading ? (
                <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full" />
              ) : customerData ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium">
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
              className="lg:hidden relative z-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 lg:hidden">
          <div className="container mx-auto px-4 pt-20">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/casto-kladene-otazky"
                className="text-xl text-gray-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Často kladené otázky
              </Link>
              <Link 
                href="/uzivanie"
                className="text-xl text-gray-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Užívanie
              </Link>
              <div>
                <button
                  className="flex items-center justify-between w-full text-xl text-gray-600 py-2"
                  onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
                >
                  Zloženie
                  <ChevronDown className={`w-5 h-5 transition-transform ${isIngredientsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isIngredientsOpen && (
                  <div className="pl-4 space-y-2">
                    {INGREDIENTS_SUBMENU.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block text-gray-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link 
                href="/blog"
                className="text-xl text-gray-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/kontakt"
                className="text-xl text-gray-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kontakt
              </Link>
              <Link 
                href="/kupit"
                className="text-xl text-center bg-green-600 text-white py-3 rounded-lg mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kúpiť teraz
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 