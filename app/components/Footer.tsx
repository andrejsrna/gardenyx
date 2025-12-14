'use client';

import { Facebook, Mail, MapPin, Phone, Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { resetCookieConsentValue } from 'react-cookie-consent';
import { deleteCookie } from 'cookies-next';
import { FormEvent, useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const openCookieManager = () => {
    resetCookieConsentValue();
    deleteCookie('cookieConsent', { path: '/' });
    deleteCookie('CookieConsent', { path: '/' });
    localStorage.removeItem('cookieConsentDetails');
    window.location.reload();
  };

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    const trimmedEmail = email.trim();
    const emailIsValid = /\S+@\S+\.\S+/.test(trimmedEmail);

    if (!emailIsValid) {
      setStatus('error');
      setMessage('Zadajte prosím platný email.');
      return;
    }

    if (!consent) {
      setStatus('error');
      setMessage('Pre odber je potrebný súhlas so spracovaním údajov.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          consent,
          source: 'footer',
          honeypot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setStatus('error');
        setMessage(errorData?.error || 'Nepodarilo sa uložiť odber. Skúste to znova.');
        return;
      }

      setStatus('success');
      setMessage('Ďakujeme, úspešne sme vás pridali do newslettera.');
      setEmail('');
      setConsent(false);
      setHoneypot('');
    } catch (error) {
      console.error('[newsletter] submit failed', error);
      setStatus('error');
      setMessage('Ups, niečo sa pokazilo. Skúste to prosím znova neskôr.');
    }
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

  const HELPFUL_LINKS = [
    { label: 'Masť na bolesť kolena', href: '/mast-na-bolest-kolena' },
    { label: 'Protizápalová masť na kĺby', href: '/protizapalova-mast-na-klby' },
    { label: 'Ako správne užívať Joint Boost', href: '/uzivanie' },
    { label: 'Často kladené otázky', href: '/casto-kladene-otazky' }
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
                  href="/newsletter"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Newsletter
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

        {/* Newsletter signup */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-white/80 p-6 sm:p-8 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-100 opacity-70" aria-hidden />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <p className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700">
                  Newsletter
                </p>
                <h3 className="text-2xl font-bold text-gray-900">Žiadne tajné tipy už neuniknú</h3>
                <p className="text-gray-700">
                  Posielam krátke rady pre zdravé kĺby a exkluzívne kupóny. Žiadny spam – maximálne jeden email týždenne.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Získate prístup k zľavám len pre odberateľov
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Praktické tipy od Andreja priamo do inboxu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Odhlásiť sa môžete jedným klikom
                  </li>
                </ul>
              </div>

              <form className="space-y-4" onSubmit={handleNewsletterSubmit}>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="newsletter-email" className="text-sm font-medium text-gray-700">Váš email</label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      placeholder="napr. jana@email.sk"
                      aria-describedby="newsletter-helper"
                    />
                  </div>
                  <div className="pt-6 sm:pt-0 ">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {status === 'loading' ? 'Odosielam…' : 'Chcem odoberať'}
                    </button>
                  </div>
                </div>

                <div className="sr-only" aria-hidden>
                  <label htmlFor="company">Nechajte toto pole prázdne</label>
                  <input
                    id="company"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="newsletter-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    required
                  />
                  <label htmlFor="newsletter-consent" className="text-sm leading-relaxed text-gray-700">
                    Súhlasím so spracovaním osobných údajov na účely zasielania newsletteru. Podrobnosti nájdete v&nbsp;
                    <Link href="/ochrana-osobnych-udajov" className="text-green-700 underline underline-offset-4 hover:text-green-800">
                      ochrane osobných údajov
                    </Link>.
                  </label>
                </div>

                <p
                  id="newsletter-helper"
                  className={`text-sm ${
                    status === 'error'
                      ? 'text-red-600'
                      : status === 'success'
                        ? 'text-green-700'
                        : 'text-gray-600'
                  }`}
                >
                  {message || 'Môžete sa kedykoľvek odhlásiť priamo z emailu.'}
                </p>
              </form>
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

        {/* Secondary links accordion */}
        <div className="mx-auto mb-8 max-w-xl">
          <details className="group rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-800">
              Užitočné odkazy
              <span className="text-lg text-green-600 transition-transform duration-200 group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              {HELPFUL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 transition hover:bg-green-50 hover:text-green-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
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
