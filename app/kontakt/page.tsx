import { Metadata } from 'next';
import { Mail, Phone, MapPin, Building2, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import { buildStaticMetadata } from '../lib/seo';

export const metadata: Metadata = buildStaticMetadata({
  title: 'Kontakt | Najsilnejšia kĺbová výživa',
  description: 'Kontaktujte nás s vašimi otázkami o kĺbovej výžive. Sme tu pre vás od pondelka do piatka, 9:00-18:00.',
  path: '/kontakt',
});

export default function ContactPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
            <p className="text-lg text-gray-600">
              Radi by sme počuli od vás! Ak máte akékoľvek otázky, pripomienky alebo návrhy, 
              neváhajte nás kontaktovať. Náš tím je vždy pripravený vám pomôcť.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Methods */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg mb-2">E-mail</h2>
                  <p className="text-gray-600 mb-1">Pre všeobecné otázky alebo pripomienky:</p>
                  <Link 
                    href="mailto:info@fitdoplnky.sk"
                    className="text-green-600 hover:underline"
                  >
                    info@fitdoplnky.sk
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg mb-2">Telefón</h2>
                  <Link 
                    href="tel:+421914230321"
                    className="text-green-600 hover:underline block mb-1"
                  >
                    +421 914 230 321
                  </Link>
                  <p className="text-gray-600">
                    Pondelok - Piatok, 9:00 - 18:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg mb-2">Adresa</h2>
                  <address className="text-gray-600 not-italic">
                    Fitdoplnky.sk<br />
                    1. mája 33<br />
                    Báhoň 90084
                  </address>
                </div>
              </div>
            </div>

            {/* Company Info & Social */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg mb-2">Spoločnosť</h2>
                  <p className="text-gray-600">
                  Enhold s.r.o.<br />
                    IČO: 55400817<br />
                    DIČ: 2121985954<br />
                    IČ DPH: SK2121985954<br />
                    Sídlo: Drobného 1900/2 841 02 Bratislava - mestská časť Dúbravka
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-4">Sociálne siete</h2>
                <div className="flex gap-4">
                  <Link
                    href="https://facebook.com/fitdoplnky.sk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </Link>
                  <Link
                    href="https://instagram.com/fitdoplnkysk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-8 rounded-2xl">
            <p className="text-gray-600 mb-4">
              Či už máte otázku o našom produkte, potrebujete poradiť s výberom, 
              alebo chcete poskytnúť spätnú väzbu o našich službách, radi vás vypočujeme. 
              Tešíme sa na to, ako vám môžeme pomôcť na vašej ceste k lepšiemu zdraviu a kondícii!
            </p>
            <p className="font-medium text-green-600">
              Ďakujeme, že ste sa rozhodli pre fitdoplnky.sk!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 
