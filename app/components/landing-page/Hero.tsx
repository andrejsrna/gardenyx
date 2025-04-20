import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Pohyb bez bolesti <span className="text-green-600">je možný</span>. Podporte svoje kĺby komplexnou výživou Joint Boost.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Joint Boost – najúčinnejšia kĺbová výživa s kolagénom, glukozamínom, kurkumou a MSM.
            </p>
            <Link
              href="/kupit" // TODO: Update this link if necessary
              className="inline-block bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
            >
              Objednať teraz – len za 14,99 €
            </Link>
          </div>

          {/* Image Section */}
          <div className="relative aspect-[3/4] max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg">
            <Image
              src="/images/landing/hero.jpeg"
              alt="Produkt Joint Boost a osoba v pohybe"
              width={1000}
              height={1000}
              className="object-cover rounded-lg shadow-2xl ring-1 ring-offset-2 ring-offset-white ring-gray-200"
              priority // Load image eagerly as it's above the fold
            />
          </div>
        </div>
      </div>
    </section>
  );
}
