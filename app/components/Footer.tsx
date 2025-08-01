'use client';

import { Facebook, Mail, MapPin, Phone, Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { resetCookieConsentValue } from 'react-cookie-consent';

export default function Footer() {
  const openCookieManager = () => {
    // Reset consent and reload page to show banner again
    resetCookieConsentValue('cookieConsent');
    localStorage.removeItem('cookieConsentDetails');
    window.location.reload();
  };

  const PAYMENT_METHODS = [
    {
      name: 'Visa',
      src: '/paymets/visa.svg'
    },
    {
      name: 'Mastercard',
      src: '/paymets/mastercard.svg'
    },
    {
      name: 'Google Pay',
      src: '/paymets/gpay.svg'
    },
    {
      name: 'Apple Pay',
      src: '/paymets/applepay.svg'
    },
    {
      name: 'Stripe',
      src: '/paymets/stripe.svg'
    }
  ];

  const SOCIAL_LINKS = [
    {
      icon: <Facebook className="w-5 h-5" />,
      href: 'https://www.facebook.com/profile.php?id=61575962272009',
      label: 'Facebook'
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: 'https://www.instagram.com/najsilnejsiaklbovavyziva',
      label: 'Instagram'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      href: 'https://www.tiktok.com/@najsilnejsiaklbov',
      label: 'TikTok'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      href: 'https://www.youtube.com/channel/UCBbGduOZK7U--mNzAy4M9cQ',
      label: 'YouTube'
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-8 pt-16 pb-8 sm:pb-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-gray-800 mb-6">Spoločnosť</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                <span>Drobného 1900/2 841 02 Bratislava - mestská časť Dúbravka</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                <span>+421 914 230 321</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                <span>info@fitdoplnky.sk</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-6">Rýchle odkazy</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/doprava-a-platba"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Doprava a platba
                </Link>
              </li>
              <li>
                <Link
                  href="/obchodne-podmienky"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Obchodné podmienky
                </Link>
              </li>
              <li>
                <Link
                  href="/ochrana-osobnych-udajov"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Ochrana osobných údajov
                </Link>
              </li>
              <li>
                <Link
                  href="/reklamacie"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Reklamácie a vrátenia
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookieManager}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Nastavenia cookies
                </button>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Personal Consultation */}
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-6">Poradíme vám</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                  <Image
                    src="/andrej-profile.jpeg"
                    alt="Andrej - zakladateľ"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="text-green-600 font-bold text-xl">A</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Andrej</p>
                  <p className="text-sm text-gray-600">Zakladateľ a odborník</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Máte otázky o našom produkte? Osobne vám poradím s dávkovaním a použitím našej kĺbovej výživy.
              </p>
              <a
                href="mailto:andrej@najsilnejsiaklbovavyziva.sk"
                className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors font-medium"
              >
                <Mail className="w-4 h-4 mr-2" />
                andrej@najsilnejsiaklbovavyziva.sk
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mb-12">
          <h3 className="font-bold text-xl text-gray-800 mb-6 text-center">Platobné metódy</h3>
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-6">
              {PAYMENT_METHODS.map((method) => (
                <div key={method.name} className="relative w-16 h-10">
                  <Image
                    src={method.src}
                    alt={method.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-8">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Subfooter */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Partners */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <span className="text-sm text-gray-600 font-medium">Partneri:</span>
            <div className="flex space-x-4">
              <a
                href="https://zdravievpraxi.sk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors"
              >
                ZdravieVPraxi.sk
              </a>
              <a
                href="https://fitdoplnky.sk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors"
              >
                FitDoplnky.sk
              </a>
            </div>
          </div>

          {/* Copyright & Badge */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p>Copyright © {new Date().getFullYear()} Najsilnejšia kĺbová výživa. Všetky práva vyhradené.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700">
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="15" fill="white"/>
                <rect y="5" width="20" height="5" fill="#0D47A1"/>
                <rect y="10" width="20" height="5" fill="#D50000"/>
                <path d="M6 5.5L4.5 9H3L5.5 2L8 9H6.5L6 5.5Z" fill="white" transform="translate(1.5 -1)"/>
                <path d="M6 5.5L4.5 9H3L5.5 2L8 9H6.5L6 5.5Z" stroke="#0D47A1" strokeWidth="0.6" transform="translate(1.5 -1)"/>
                <circle cx="5.5" cy="4" r="2.5" fill="none" stroke="#D50000" strokeWidth="1.2" transform="translate(1.5 -1)"/>
              </svg>
              <span>Slovenský produkt</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
