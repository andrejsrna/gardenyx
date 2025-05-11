'use client';

import { ArrowRight, Percent, Truck } from 'lucide-react';
import Link from 'next/link';
import { trackFbEvent } from './FacebookPixel';

export default function CTA() {
  const handleBuyClick = () => {
    trackFbEvent('Purchase Intent', { content_name: 'Main CTA Button' });
  };

  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Benefits */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm">Doprava zadarmo od 40€</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm">Množstevná zľava</span>
            </div>
          </div>

          {/* CTA Content */}
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Získajte množstvenú zľavu <br className="hidden sm:block" />
              a dopravu zadarmo od 39.99 eur
            </h2>

            <Link
              href="/kupit"
              onClick={handleBuyClick}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors group"
            >
              Kúpiť najsilnejšiu kĺbovú výživu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Optional: Add trust indicators */}
          <div className="pt-8">
            <p className="text-sm text-gray-500">
              Certifikované RÚVZ ・ Slovenský produkt ・ Rýchle doručenie
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
