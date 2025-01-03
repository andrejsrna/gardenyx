import { Truck, CreditCard, Package, Clock, Gift, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const shippingInfo = [
  {
    icon: <Package className="w-8 h-8" />,
    title: 'Doprava zadarmo',
    description: 'Pri objednávke 3 a viac balení Najsilnejšej kĺbovej výživy máte dopravu zadarmo.'
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'Packeta',
    description: 'Doručenie zabezpečuje spoločnosť Packeta pre rýchle a spoľahlivé doručenie.'
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Rýchle doručenie',
    description: 'Väčšinu objednávok doručíme do 1-2 pracovných dní.'
  }
];

const paymentInfo = [
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'Platba kartou',
    description: 'Bezpečná online platba kartou cez zabezpečenú bránu.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'Platba na dobierku',
    description: 'Možnosť zaplatiť pri prevzatí zásielky.'
  },
  {
    icon: <Gift className="w-8 h-8" />,
    title: 'Výhodné balíčky',
    description: 'Špeciálne ceny pri nákupe väčšieho množstva balení.'
  }
];

export default function DopravaAPlatbaPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Doprava a platba</h1>
          
          {/* Shipping Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Výhodné poštovné v našom e-shope</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {shippingInfo.map((info, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="text-green-600 mb-4">
                    {info.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    {info.title}
                  </h3>
                  <p className="text-gray-600">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Možnosti platby</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {paymentInfo.map((info, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="text-green-600 mb-4">
                    {info.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    {info.title}
                  </h3>
                  <p className="text-gray-600">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-green-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Objednajte si Najsilnejšiu kĺbovú výživu
            </h2>
            <p className="text-gray-600 mb-6">
              Využite výhodné poštovné a vyberte si z našich zvýhodnených balíčkov.
            </p>
            <Link
              href="/kupit"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Prejsť do obchodu
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
} 