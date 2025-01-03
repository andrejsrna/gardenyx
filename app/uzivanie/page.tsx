import { Metadata } from 'next';
import { Calendar, AlertTriangle, Package, Sun, Droplets } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Užívanie JointBoost | Najsilnejšia kĺbová výživa',
  description: 'Správne dávkovanie a užívanie kĺbovej výživy JointBoost. Odporúčané dávkovanie je 1 kapsula denne.',
};

export default function UsagePage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Užívanie JointBoost</h1>
            <p className="text-lg text-gray-600">
              Správne užívanie pre maximálnu účinnosť
            </p>
          </header>

          {/* Main dosage section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              Odporúčané dávkovanie
            </h2>
            <p className="text-gray-600 mb-6">
              Odporúčané dávkovanie doplnku Najlepšia kĺbová výživa Joint Boost je 1x kapsula denne. 
              Zapiť dostatočným množstvom vody.
            </p>
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700">
                Veľmi dôležité je pravidelné užívanie doplnku. Prvé účinky môžete začať pocitovať až po pár týždňoch. 
                Odporúčame napríklad trojbalenie, ku ktorému dostanete aj dopravu zadarmo. 
                Trojbalenie vystačí na 3 mesiace užívania.
              </p>
            </div>
            <p className="text-gray-600">
              Ak vás zaujíma zloženie doplnku, prosím pozrite si{' '}
              <Link href="/zlozenie" className="text-green-600 hover:underline">
                podstránku zloženie
              </Link>
              . Ku každej zložke máme rozpísané jej účinky a aj podložené vedecké štúdie o tom ako zložka pôsobí na zdravie kĺbov.
            </p>
          </section>

          {/* Warning section */}
          <section className="bg-amber-50 rounded-2xl p-8 mb-8 border border-amber-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-amber-800">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Upozornenie
            </h2>
            <ul className="space-y-2 text-amber-800">
              <li>Ustanovená denná dávka sa nesmie presiahnuť.</li>
              <li>Výživový doplnok sa nesmie používať ako náhrada rozmanitej stravy.</li>
              <li>Skladujte mimo dosahu detí.</li>
              <li>Nevhodné pre deti, tehotné a dojčiace ženy.</li>
            </ul>
          </section>

          {/* Storage instructions */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Sun className="w-6 h-6 text-green-600" />
              Skladovanie
            </h2>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  Skladujte v suchu mimo priameho slnečného žiarenia
                </p>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Nevystavujte mrazu a vlhkosti
                </p>
              </div>
            </div>
          </section>

          {/* Package info */}
          <section className="bg-green-50 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Package className="w-6 h-6 text-green-600" />
              1 balenie = 1 mesiac
            </h2>
            <p className="text-gray-700">
              Jedno balenie Joint Boost vám vystačí na jeden mesiac pri odporúčanom dávkovaní.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 