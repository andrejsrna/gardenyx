'use client';

import Image from 'next/image';
import { resetCookieConsentValue } from 'react-cookie-consent';
import { deleteCookie } from 'cookies-next';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { safeRemoveItem } from '../lib/utils/safe-local-storage';
import { Link } from '../../i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const openCookieManager = () => {
    resetCookieConsentValue();
    deleteCookie('cookieConsent', { path: '/' });
    deleteCookie('CookieConsent', { path: '/' });
    safeRemoveItem('cookieConsentDetails');
    window.location.reload();
  };

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    const trimmedEmail = email.trim();
    const emailIsValid = /\S+@\S+\.\S+/.test(trimmedEmail);

    if (!emailIsValid) {
      setStatus('error');
      setMessage(t('newsletter.messages.invalidEmail'));
      return;
    }

    if (!consent) {
      setStatus('error');
      setMessage(t('newsletter.messages.missingConsent'));
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
        setMessage(errorData?.error || t('newsletter.messages.genericError'));
        return;
      }

      setStatus('success');
      setMessage(t('newsletter.messages.success'));
      setEmail('');
      setConsent(false);
      setHoneypot('');
    } catch {
      setStatus('error');
      setMessage(t('newsletter.messages.genericError'));
    }
  };

  const paymentMethods = [
    { name: 'Visa', src: '/paymets/visa.svg' },
    { name: 'Mastercard', src: '/paymets/mastercard.svg' },
    { name: 'Google Pay', src: '/paymets/gpay.svg' },
    { name: 'Apple Pay', src: '/paymets/applepay.svg' },
    { name: 'Stripe', src: '/paymets/stripe.svg' },
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-8 pb-10 pt-16 sm:pb-16">
        <div className="mb-14">
          <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-white/80 p-6 shadow-lg sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-100 opacity-70" aria-hidden />
            <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="space-y-4">
                <p className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700">
                  {t('newsletter.eyebrow')}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{t('newsletter.title')}</h3>
                <p className="text-gray-700">{t('newsletter.description')}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    {t('newsletter.bullets.first')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    {t('newsletter.bullets.second')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    {t('newsletter.bullets.third')}
                  </li>
                </ul>
              </div>

              <form className="space-y-4" onSubmit={handleNewsletterSubmit}>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="newsletter-email" className="text-sm font-medium text-gray-700">
                      {t('newsletter.emailLabel')}
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      placeholder={t('newsletter.emailPlaceholder')}
                      aria-describedby="newsletter-helper"
                    />
                  </div>
                  <div className="pt-6 sm:pt-0">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {status === 'loading' ? t('newsletter.submitLoading') : t('newsletter.submit')}
                    </button>
                  </div>
                </div>

                <div className="sr-only" aria-hidden>
                  <label htmlFor="company">{t('newsletter.honeypotLabel')}</label>
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
                    {t('newsletter.consent.prefix')}{' '}
                    <Link href="/ochrana-osobnych-udajov" className="text-green-700 underline underline-offset-4 hover:text-green-800">
                      {t('newsletter.consent.link')}
                    </Link>
                    .
                  </label>
                </div>

                <p
                  id="newsletter-helper"
                  className={`text-sm ${
                    status === 'error' ? 'text-red-600' : status === 'success' ? 'text-green-700' : 'text-gray-600'
                  }`}
                >
                  {message || t('newsletter.messages.helper')}
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-6 text-center text-xl font-bold text-gray-800">{t('payments.title')}</h3>
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-6">
              {paymentMethods.map((method) => (
                <div key={method.name} className="relative h-10 w-16">
                  <Image src={method.src} alt={method.name} fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-600">
            <Link href="/obchodne-podmienky" className="transition hover:text-green-700">
              {t('links.terms')}
            </Link>
            <Link href="/ochrana-osobnych-udajov" className="transition hover:text-green-700">
              {t('links.privacy')}
            </Link>
            <Link href="/stiahnut" className="transition hover:text-green-700">
              {t('links.download')}
            </Link>
            <button onClick={openCookieManager} className="transition hover:text-green-700">
              {t('links.cookies')}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>
            Copyright © {new Date().getFullYear()} GardenYX. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
