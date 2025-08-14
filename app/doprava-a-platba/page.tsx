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

          {/* Ako funguje Packeta */}
          <section id="ako-funguje-packeta" className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Ako funguje Packeta?</h2>
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <h3 className="font-semibold mb-2">Doručenie na výdajné miesto</h3>
                <p className="text-gray-600">
                  Pri voľbe „Packeta – Výdajné miesto“ si v pokladni vyberiete najbližšie odberné miesto. 
                  Po odovzdaní zásielky dopravcovi dostanete e‑mail a SMS s kódom pre vyzdvihnutie. 
                  Balík býva bežne pripravený na vyzdvihnutie do 1–2 pracovných dní. Na vyzdvihnutie máte zvyčajne 7 dní.
                </p>
                <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-1">
                  <li>Z‑BOX otvoríte cez mobilnú aplikáciu Packeta alebo zadaním číselného kódu.</li>
                  <li>Pri dobierke je potrebné zaplatiť vopred online (v aplikácii alebo cez platobný odkaz v SMS/e‑maile).</li>
                  <li>Platba priamo v Z‑BOXe ani v hotovosti na mieste nie je podporovaná.</li>
                  <li>Úložnú dobu zásielky si viete predĺžiť v aplikácii.</li>
                  <li>Stav zásielky môžete sledovať na webe alebo v mobilnej aplikácii.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Doručenie domov kuriérom</h3>
                <p className="text-gray-600">
                  Pri voľbe „Packeta – Doručenie domov“ vám kuriér doručí zásielku priamo na vašu adresu. 
                  O termíne doručenia budete informovaní cez SMS/e‑mail s možnosťou zmeny termínu alebo adresy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sledovanie zásielky</h3>
                <p className="text-gray-600">
                  Stav zásielky je možné sledovať cez trackovací link, ktorý vám pošleme v potvrdení objednávky.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Poplatky a doprava zdarma</h3>
                <p className="text-gray-600">
                  Presné ceny dopravy uvidíte v pokladni podľa zvoleného spôsobu doručenia. 
                  Pri nákupe nad stanovený limit poskytujeme dopravu zdarma.
                </p>
              </div>
              <div className="pt-2">
                <Link 
                  href="https://www.packeta.sk/zakaznicky-servis#t3ppiy#NR2E0X" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-700 hover:text-green-800 underline"
                >
                  Viac informácií na webe Packeta (Zákaznícky servis)
                </Link>
              </div>
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