'use client';

import Link from 'next/link';
import CureBundles from '@/app/kupit/CureBundles';

type Props = {
  buttonText?: string;
  className?: string;
};

export default function CureBundlesSection({
  buttonText = 'Zobraziť všetky produkty',
  className,
}: Props) {
  return (
    <div className={className}>
      <CureBundles />
      <div className="container mx-auto px-4">
        <div className="mt-6 flex justify-center">
          <Link
            href="/kupit"
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
