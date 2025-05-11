'use client';

import Link from 'next/link';
import { ArrowRight, Percent, Truck, Star, Shield, Clock, Check } from 'lucide-react';
import { trackFbEvent } from './FacebookPixel';

export default function CTAWithContent() {
  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Prémiová kvalita',
      description: 'Certifikované RÚVZ'
    },
    {
      icon: <Star className="w-6 h-6 text-green-600" />,
      title: '100% Prírodné',
      description: 'Bez umelých prísad'
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: 'Rýchle dodanie',
      description: 'Do 2 pracovných dní'
    },
    {
      icon: <Check className="w-6 h-6 text-green-600" />,
      title: 'Overená účinnosť',
      description: 'Tisíce spokojných zákazníkov'
    }
  ];

  const handleBuyClick = () => {
    trackFbEvent('Purchase Intent', { content_name: 'Premium CTA Button' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 py-24">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-50/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/50 text-green-700 text-sm font-medium">
                <Star className="w-4 h-4" fill="currentColor" />
                Prémiová kvalita
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                Kúpiť najsilnejšiu 
                <span className="text-green-600"> kĺbovú výživu</span>
              </h2>

              <div className="prose prose-lg text-gray-600">
                <p>
                  Produkt &quot;Najsilnejšia kĺbová výživa, Joint Boost&quot; je prémiový doplnok stravy 
                  určený na podporu zdravia kĺbov a zlepšenie ich mobility.
                </p>
                <p>
                  Tento produkt je vytvorený s použitím špičkovej vedeckej technológie a obsahuje 
                  vyváženú kombináciu prírodných zložiek.
                </p>
              </div>

              {/* Shipping and Discount Info */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Doprava zadarmo</p>
                    <p className="text-sm text-gray-500">Pri nákupe nad 40€</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Percent className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Množstevná zľava</p>
                    <p className="text-sm text-gray-500">Pri väčšom odbere</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Link
                  href="/kupit"
                  onClick={handleBuyClick}
                  className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-300 hover:shadow-lg hover:shadow-green-200"
                >
                  Kúpiť teraz
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit) => (
                <div 
                  key={benefit.title}
                  className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                    {benefit.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 