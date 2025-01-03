"use client";

import { ChevronDown, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MenuItem {
  title: string;
  href: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Často kladené otázky',
    href: '/casto-kladene-otazky',
  },
  {
    title: 'Užívanie',
    href: '/uzivanie',
  },
  {
    title: 'Zloženie',
    href: '/zlozenie',
    children: [
      { title: 'Glukozamín', href: '/glukozamin' },
      { title: 'Chondroitín', href: '/chondroitin' },
      { title: 'MSM prášok', href: '/msm-prasok' },
      { title: 'Vitamín C', href: '/vitamin-c' },
      { title: 'Kolagén', href: '/kolagen-na-klby' },
      { title: 'Kurkuma', href: '/kurkuma-na-klby' },
      { title: 'Čierne korenie', href: '/cierne-korenie' },
      { title: 'Kyselina hyaluronová', href: '/kyselina-hyaluronova' },
      { title: 'Boswellia Serata', href: '/boswellia-serata' },
    ],
  },
  {
    title: 'Blog',
    href: '/blog',
  },
];

export default function MainNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <ul className="flex items-center gap-8">
          {menuItems.map((item) => (
            <li key={item.title} className="relative group">
              <Link 
                href={item.href}
                className="flex items-center gap-1 py-4 text-gray-700 hover:text-green-600 transition-colors text-sm font-medium"
              >
                {item.title}
                {item.children && (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Link>

              {item.children && (
                <ul className="absolute left-0 top-full bg-white shadow-lg rounded-lg py-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {item.children.map((child) => (
                    <li key={child.title}>
                      <Link
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <ul className="px-4 py-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  <div
                    className="flex items-center justify-between py-2"
                    onClick={() => item.children && toggleSubmenu(item.title)}
                  >
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-green-600"
                      onClick={() => !item.children && setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                    {item.children && (
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          openSubmenu === item.title ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {item.children && openSubmenu === item.title && (
                    <ul className="pl-4 py-2">
                      {item.children.map((child) => (
                        <li key={child.title}>
                          <Link
                            href={child.href}
                            className="block py-2 text-gray-600 hover:text-green-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
} 