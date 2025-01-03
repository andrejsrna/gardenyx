'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function Footer() {
  const { openCookieManager } = useCookieConsent();

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
      href: 'https://facebook.com/fitdoplnky.sk',
      label: 'Facebook'
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: 'https://instagram.com/fitdoplnkysk',
      label: 'Instagram'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      href: 'mailto:info@fitdoplnky.sk',
      label: 'Email'
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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

          {/* Partners */}
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-6">Partneri</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://zdravievpraxi.sk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  ZdravieVPraxi.sk
                </a>
              </li>
              <li>
                <a 
                  href="https://fitdoplnky.sk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  FitDoplnky.sk
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-6">Platobné metódy</h3>
            <div className="grid grid-cols-3 gap-4">
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

        {/* Copyright */}
        <div className="text-center text-sm text-gray-600">
          <p>Copyright © {new Date().getFullYear()} JointBoost. Všetky práva vyhradené.</p>
        </div>
      </div>
    </footer>
  );
} 