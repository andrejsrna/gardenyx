'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BellOff, CheckCircle2, Mail, Shield } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterPage() {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeConsent, setSubscribeConsent] = useState(false);
  const [subscribeHoneypot, setSubscribeHoneypot] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<Status>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('Žiadny spam, maximálne jeden email týždenne.');

  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [unsubscribeStatus, setUnsubscribeStatus] = useState<Status>('idle');
  const [unsubscribeMessage, setUnsubscribeMessage] = useState('Odhlásenie platí okamžite.');

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (subscribeStatus === 'loading') return;

    const email = subscribeEmail.trim();
    if (!isValidEmail(email)) {
      setSubscribeStatus('error');
      setSubscribeMessage('Zadajte prosím platný email.');
      return;
    }

    if (!subscribeConsent) {
      setSubscribeStatus('error');
      setSubscribeMessage('Pre odber je potrebný súhlas so spracovaním údajov.');
      return;
    }

    setSubscribeStatus('loading');
    setSubscribeMessage('Odosielam...');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          consent: subscribeConsent,
          source: 'newsletter-page',
          honeypot: subscribeHoneypot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSubscribeStatus('error');
        setSubscribeMessage(errorData?.error || 'Nepodarilo sa pridať odber. Skúste znova.');
        return;
      }

      setSubscribeStatus('success');
      setSubscribeMessage('Ďakujeme, odber je aktívny. Skontrolujte inbox a spam priečinok.');
      setSubscribeEmail('');
      setSubscribeConsent(false);
      setSubscribeHoneypot('');
    } catch (error) {
      console.error('[newsletter] subscribe failed', error);
      setSubscribeStatus('error');
      setSubscribeMessage('Ups, niečo sa pokazilo. Skúste to prosím znova neskôr.');
    }
  };

  const handleUnsubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (unsubscribeStatus === 'loading') return;

    const email = unsubscribeEmail.trim();
    if (!isValidEmail(email)) {
      setUnsubscribeStatus('error');
      setUnsubscribeMessage('Zadajte prosím platný email.');
      return;
    }

    setUnsubscribeStatus('loading');
    setUnsubscribeMessage('Odosielam odhlásenie...');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setUnsubscribeStatus('error');
        setUnsubscribeMessage(errorData?.error || 'Nepodarilo sa odhlásiť. Skúste znova.');
        return;
      }

      setUnsubscribeStatus('success');
      setUnsubscribeMessage('Email bol odhlásený. Mrzí nás, že odchádzate.');
      setUnsubscribeEmail('');
    } catch (error) {
      console.error('[newsletter] unsubscribe failed', error);
      setUnsubscribeStatus('error');
      setUnsubscribeMessage('Ups, niečo sa pokazilo. Skúste to prosím znova neskôr.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-green-50/50 to-white">
      <div className="container mx-auto px-6 sm:px-8 py-16 sm:py-24 max-w-5xl">
        <div className="mb-12 space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-700">
            <Mail className="h-4 w-4" />
            Newsletter
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Tipy pre zdravé kĺby a exkluzívne akcie</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Andrej posiela krátke rady, ktoré vám pomôžu s pohybom bez bolesti. Odporúčania, ako na dávkovanie Joint Boostu,
            a zľavy, ktoré inde nedávame. Žiadny spam, odhlásiť sa môžete kedykoľvek.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-green-100 bg-white/80 p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Chcem odoberať</h2>
                <p className="text-sm text-gray-600">Pridajte sa k odberateľom a nič vám neunikne.</p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubscribe}>
              <div>
                <label htmlFor="subscribe-email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="subscribe-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="vas@email.sk"
                />
              </div>

              <div className="sr-only" aria-hidden>
                <label htmlFor="subscribe-company">Nechajte toto pole prázdne</label>
                <input
                  id="subscribe-company"
                  name="subscribe-company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={subscribeHoneypot}
                  onChange={(e) => setSubscribeHoneypot(e.target.value)}
                  className="hidden"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="subscribe-consent"
                  type="checkbox"
                  checked={subscribeConsent}
                  onChange={(e) => setSubscribeConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  required
                />
                <label htmlFor="subscribe-consent" className="text-sm text-gray-700 leading-relaxed">
                  Súhlasím so spracovaním osobných údajov na účely zasielania newsletteru. Detaily sú v{' '}
                  <Link href="/ochrana-osobnych-udajov" className="text-green-700 underline underline-offset-4 hover:text-green-800">
                    ochrane osobných údajov
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {subscribeStatus === 'loading' ? 'Odosielam…' : 'Prihlásiť sa'}
              </button>

              <p
                className={`text-sm ${
                  subscribeStatus === 'error'
                    ? 'text-red-600'
                    : subscribeStatus === 'success'
                      ? 'text-green-700'
                      : 'text-gray-600'
                }`}
              >
                {subscribeMessage}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                Vaše údaje chránime a nepoužívame na reklamu tretích strán.
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white/70 p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3">
              <BellOff className="h-6 w-6 text-gray-700" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Chcem sa odhlásiť</h2>
                <p className="text-sm text-gray-600">Jedným formulárom ukončíte odber newsletteru.</p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleUnsubscribe}>
              <div>
                <label htmlFor="unsubscribe-email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="unsubscribe-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={unsubscribeEmail}
                  onChange={(e) => setUnsubscribeEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="vas@email.sk"
                />
              </div>

              <button
                type="submit"
                disabled={unsubscribeStatus === 'loading'}
                className="w-full rounded-xl border border-gray-300 bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-300/30 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {unsubscribeStatus === 'loading' ? 'Odosielam…' : 'Odhlásiť sa'}
              </button>

              <p
                className={`text-sm ${
                  unsubscribeStatus === 'error'
                    ? 'text-red-600'
                    : unsubscribeStatus === 'success'
                      ? 'text-green-700'
                      : 'text-gray-600'
                }`}
              >
                {unsubscribeMessage}
              </p>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                Odhlásiť sa môžete aj kliknutím na odkaz v päte každého emailu. Toto je okamžitá alternatíva, ak odkaz nemáte po ruke.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
