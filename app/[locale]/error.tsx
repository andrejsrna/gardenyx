'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 shadow-sm text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">
          GardenYX
        </p>
        <h1 className="mb-3 text-2xl font-semibold text-gray-900">
          Niečo sa pokazilo
        </h1>
        <p className="mb-6 text-gray-500 leading-relaxed">
          Na stránke nastala neočakávaná chyba. Skúste to znova alebo sa vráťte na hlavnú stránku.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Skúsiť znova
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
          >
            Späť na hlavnú
          </Link>
        </div>
      </div>
    </main>
  );
}
