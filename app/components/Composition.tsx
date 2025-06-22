'use client';

import { Pill, Clock, Droplets, ArrowRight } from 'lucide-react';
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
  { name: 'Kyselina hyalurónová', amount: '10mg', slug: 'kyselina-hyaluronova', image: '/images/ingredients/kyselina-hyaluronova.jpeg' },
  { name: 'Boswellia Serrata', amount: '5mg', slug: 'boswellia', image: '/images/ingredients/boswellia-serata.jpeg' },
];

export default function Composition() {
  const handleOrderClick = () => {
    const addToCartButton = document.getElementById('add-to-cart-top');
    if (addToCartButton) {
      addToCartButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Give it a moment to scroll before clicking
      setTimeout(() => {
        addToCartButton.click();
      }, 500); // 500ms delay
    }
  };

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jedinečné zloženie pre maximálny účinok
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Každá kapsula je nabitá vedecky overenými látkami v optimálnom pomere pre zdravie vašich kĺbov, šliach a chrupaviek.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
            
            {/* Top Part - Usage */}
            <div className="p-8 bg-gray-50/50 border-b border-gray-200/80">
                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Užívanie a dávkovanie</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {/* Capsules Info */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Pill className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">30 vegánskych kapsúl</h4>
                            <p className="text-gray-600 text-sm">Mesačné balenie</p>
                        </div>
                    </div>

                    {/* Usage Info */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">1 kapsula denne</h4>
                            <p className="text-gray-600 text-sm">Zapiť dostatočným množstvom vody</p>
                        </div>
                    </div>

                    {/* Duration Info */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">Dlhodobé užívanie</h4>
                            <p className="text-gray-600 text-sm">Pre najlepšie výsledky</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Part - Ingredients */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Čo obsahuje každá kapsula?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  {ingredients.map((ingredient) => (
                    <Link 
                      href={`/zlozenie/${ingredient.slug}`}
                      key={ingredient.name}
                      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={ingredient.image}
                          alt={ingredient.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">
                            {ingredient.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {ingredient.amount}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
              </div>
            </div>
            
             {/* CTA Button as a footer of the card */}
             <div className="p-6 bg-gray-50/50 border-t border-gray-200/80 text-center">
                 <button
                    onClick={handleOrderClick}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors group text-base"
                  >
                    Objednať kĺbovú výživu
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
             </div>

          </div>
        </div>
      </div>
    </section>
  );
} 