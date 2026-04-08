'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('checkout.runtimeError');
  const pathname = usePathname();

  useEffect(() => {
    console.error('[checkout route error]', {
      message: error.message,
      digest: error.digest,
      pathname,
      stack: error.stack,
    });

    Sentry.captureException(error, {
      tags: {
        area: 'checkout-route',
      },
      extra: {
        digest: error.digest,
        pathname,
      },
    });
  }, [error, pathname]);

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
          GardenYX Checkout
        </p>
        <h1 className="mb-3 text-3xl font-semibold text-slate-900">{t('title')}</h1>
        <p className="mb-6 text-base leading-7 text-slate-600">{t('description')}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {t('retry')}
        </button>
      </div>
    </main>
  );
}
