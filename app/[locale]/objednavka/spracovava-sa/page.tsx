"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

const MESSAGES: Record<string, { title: string; desc: string; note: string; contact: string; shop: string }> = {
  sk: {
    title: 'Platba prebehla úspešne',
    desc: 'Vaša objednávka sa práve spracováva. Potvrdenie dorazí na váš e-mail.',
    note: 'Ak ste potvrdenie nedostali do niekoľkých minút, skontrolujte priečinok spam alebo nás kontaktujte.',
    contact: 'Kontaktovať podporu',
    shop: 'Späť do obchodu',
  },
  en: {
    title: 'Payment successful',
    desc: 'Your order is being processed. A confirmation will be sent to your email.',
    note: 'If you haven\'t received a confirmation within a few minutes, please check your spam folder or contact us.',
    contact: 'Contact support',
    shop: 'Back to shop',
  },
  hu: {
    title: 'A fizetés sikeres volt',
    desc: 'Rendelése feldolgozás alatt áll. Visszaigazolást küldünk e-mailben.',
    note: 'Ha néhány percen belül nem kapott visszaigazolást, ellenőrizze a spam mappát, vagy lépjen kapcsolatba velünk.',
    contact: 'Kapcsolatfelvétel',
    shop: 'Vissza az áruházba',
  },
};

export default function ProcessingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sk';
  const pi = params.get('pi');
  const m = MESSAGES[locale] || MESSAGES.sk;

  const [checking, setChecking] = useState(Boolean(pi));
  const [attempts, setAttempts] = useState(0);

  // Continue polling — webhook may still be processing
  useEffect(() => {
    if (!pi) {
      return;
    }
    let count = 0;
    const timer = setInterval(async () => {
      count += 1;
      setAttempts(count);
      try {
        const res = await fetch(`/api/orders?payment_intent=${encodeURIComponent(pi)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const oid = data?.order?.id || data?.orderId;
          if (oid) {
            clearInterval(timer);
            router.replace(`/${locale}/objednavka/uspesna/${oid}`);
            return;
          }
        }
      } catch {}
      if (count >= 20) {
        clearInterval(timer);
        setChecking(false);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [pi, router, locale]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{m.title}</h1>
        <p className="text-gray-600 mb-4">{m.desc}</p>

        {checking && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
            <span>{attempts > 0 ? `Overujem stav... (${attempts}/20)` : 'Kontrolujem objednávku...'}</span>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">{m.note}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/kontakt`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {m.contact}
          </Link>
          <Link
            href={`/${locale}/kupit`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-green-600 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            {m.shop}
          </Link>
        </div>
      </div>
    </div>
  );
}
