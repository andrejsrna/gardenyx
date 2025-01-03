import { Pill, Clock, Droplets, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Ingredient {
  name: string;
  amount: string;
  slug: string;
  image: string;
}

const ingredients: Ingredient[] = [
  { name: 'Glukozamín', amount: '200mg', slug: 'glukozamin', image: '/images/ingredients/glukozamin.jpeg' },
  { name: 'Chondroitín', amount: '100mg', slug: 'chondroitin', image: '/images/ingredients/chondroitin.jpeg' },
  { name: 'MSM', amount: '100mg', slug: 'msm', image: '/images/ingredients/msm.jpeg' },
  { name: 'Vitamín C', amount: '40mg', slug: 'vitamin-c', image: '/images/ingredients/vitamin-c.jpeg' },
  { name: 'Kolagén', amount: '40mg', slug: 'kolagen', image: '/images/ingredients/kolagen.jpeg' },
  { name: 'Kurkuma', amount: '10mg', slug: 'kurkuma', image: '/images/ingredients/kurkuma.jpeg' },
  { name: 'Čierne korenie', amount: '5mg', slug: 'cierne-korenie', image: '/images/ingredients/cierne-korenie.jpeg' },
  { name: 'Kyselina hyaluronová', amount: '10mg', slug: 'kyselina-hyaluronova', image: '/images/ingredients/kyselina-hyaluronova.jpeg' },
  { name: 'Boswellia Serata', amount: '5mg', slug: 'boswellia', image: '/images/ingredients/boswellia-serata.jpeg' },
];

export default function Composition() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 py-24">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-green-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Zloženie najsilnejšej kĺbovej výživy
            </h2>
            <p className="text-green-50/90 text-lg max-w-2xl mx-auto">
              Každá zložka bola starostlivo vybraná pre svoje jedinečné vlastnosti a benefity pre zdravie vašich kĺbov
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Ingredients */}
            <div className="grid gap-4">
              {ingredients.map((ingredient) => (
                <Link 
                  href={`/zlozenie/${ingredient.slug}`}
                  key={ingredient.name}
                  className="group relative flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={ingredient.image}
                      alt={ingredient.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium group-hover:text-green-100 transition-colors">
                        {ingredient.name}
                      </span>
                      <span className="text-green-50/80 text-sm">
                        {ingredient.amount}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>

            {/* Right Side - Usage Instructions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 space-y-8 border border-white/20">
              <div className="space-y-6">
                {/* Capsules Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Balenie</h3>
                    <p className="text-green-50/90">
                      30 kapsúl v balení (vegánske, z rastlinnej celulózy)
                    </p>
                  </div>
                </div>

                {/* Usage Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Dávkovanie</h3>
                    <p className="text-green-50/90">
                      1x kapsula, 1x denne, zapiť dostatočným množstvom vody
                    </p>
                  </div>
                </div>

                {/* Duration Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Odporúčanie</h3>
                    <p className="text-green-50/90">
                      Najlepšie výsledky pri dlhodobom užívaní
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/kupit"
                className="inline-flex items-center justify-center w-full gap-2 bg-white text-green-600 py-3 px-6 rounded-xl font-medium hover:bg-green-50 transition-colors group"
              >
                Kúpiť teraz
                <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 