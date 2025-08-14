import { Award, Check, Clock, Pill } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-green-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-green-300/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Content Section */}
          <div className="flex-1 space-y-8 text-white">
            <div className="space-y-6">
              <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium inline-block border border-white/20">
                Prémiová kvalita
              </span>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Podpora kĺbov, na ktorú sa môžete spoľahnúť
              </h1>

              <p className="text-lg text-green-50/90 max-w-xl">
                Zmysluplné zloženie, jasné dávkovanie, férová komunikácia. Od roku 2023 bez
                negatívnych ohlasov.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                <Link
                  href="/kupit"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-green-700 font-medium hover:bg-green-50 transition-colors"
                >
                  Pozrieť produkty
                </Link>
                <Link
                  href="https://www.youtube.com/watch?v=wgRs0hHTfDo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Ako to funguje
                </Link>
              </div>

              <div className="text-green-50/80 text-sm pt-3">
                200+ objednávok od 2023 · 0 reklamácií · Overené platby
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="group flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-900/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Check className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative">
                  <span className="font-bold text-3xl bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">9</span>
                  <span className="text-green-50/90 text-sm block mt-1 group-hover:text-white transition-colors">účinných zložiek</span>
                </div>
              </div>

              <div className="group flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-900/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Pill className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative">
                  <span className="font-bold text-3xl bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">1</span>
                  <span className="text-green-50/90 text-sm block mt-1 group-hover:text-white transition-colors">kapsula denne</span>
                </div>
              </div>

              <div className="group flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-900/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Award className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative">
                  <span className="text-green-50/90 text-sm block mb-1 group-hover:text-white transition-colors">Certifikácia</span>
                  <span className="font-bold text-xl bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">RÚVZ</span>
                </div>
              </div>

              <div className="group flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-900/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Clock className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative">
                  <span className="font-bold text-3xl bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">510</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">mg</span>
                  <span className="text-green-50/90 text-sm block mt-1 group-hover:text-white transition-colors">v 1 kapsuli</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image Section */}
          <div className="flex-1 relative">
            <div className="relative aspect-square max-w-[500px] mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-[spin_30s_linear_infinite]"></div>
              <div className="absolute inset-[10%] rounded-full border-4 border-white/10 animate-[spin_20s_linear_infinite_reverse]"></div>
              <div className="absolute inset-[20%] rounded-full border-4 border-white/10 animate-[spin_15s_linear_infinite]"></div>

              {/* Product image with glass effect background */}
              <div className="absolute inset-[5%] rounded-full bg-white/20 backdrop-blur-xl"></div>
              <div className="relative h-full w-full">
                <Image
                  src="/product-image.png"
                  alt="Kĺbová výživa produkt"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-6 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
