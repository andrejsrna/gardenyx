'use client';

import { ArrowRight, Percent, Truck } from 'lucide-react';
import Link from 'next/link';
import { trackServerSideEvent } from '../lib/server-side-tracking';

export default function CTA() {
  const handleBuyClick = () => {
    trackServerSideEvent('Purchase Intent', { content_name: 'Main CTA Button' });
  };

  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* CTA Content */}
          <div className="space-y-8">

            <Link
              href="/kupit"
              onClick={handleBuyClick}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors group"
            >
              Kúpiť najsilnejšiu kĺbovú výživu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Certifikované RÚVZ</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
              <span className="text-sm font-medium">Slovenský produkt</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Rýchle doručenie</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
