'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Ingredient {
  name: string;
  slug: string;
  description: string;
  image: string;
  benefits: string[];
}

interface RelatedIngredientsProps {
  currentIngredient?: string;
  category?: 'joint-support' | 'anti-inflammatory' | 'cartilage-health' | 'all';
  maxItems?: number;
  title?: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    name: 'Glukozamín',
    slug: 'glukozamin',
    description: 'Prirodzená stavebná látka chrupavky pre zdravie kĺbov',
    image: '/images/ingredients/glukozamin.jpeg',
    benefits: ['podpora chrupavky', 'zmiernenie bolesti', 'lepšia pohyblivosť']
  },
  {
    name: 'Chondroitín',
    slug: 'chondroitin',
    description: 'Kľúčová zložka kĺbového tkaniva pre jeho integritu',
    image: '/images/ingredients/chondroitin.jpeg',
    benefits: ['podpora kĺbov', 'protizápalové účinky', 'zdravá chrupavka']
  },
  {
    name: 'MSM',
    slug: 'msm',
    description: 'Organická síra pre podporu kĺbového zdravia',
    image: '/images/ingredients/msm.jpeg',
    benefits: ['protizápalové účinky', 'podpora regenerácie', 'zmierňovanie bolesti']
  },
  {
    name: 'Kolagén',
    slug: 'kolagen',
    description: 'Najdôležitejší protein pre pevnosť a pružnosť kĺbov',
    image: '/images/ingredients/kolagen.jpeg',
    benefits: ['štruktúra kĺbov', 'pružnosť tkanív', 'podpora regenerácie']
  },
  {
    name: 'Kurkuma',
    slug: 'kurkuma',
    description: 'Tradičné korenie s výraznými protizápalovými účinkami',
    image: '/images/ingredients/kurkuma.jpeg',
    benefits: ['protizápalové účinky', 'antioxidanty', 'podpora imunity']
  },
  {
    name: 'Vitamín C',
    slug: 'vitamin-c',
    description: 'Nevyhnutný vitamín pre tvorbu kolagénu a zdravie kĺbov',
    image: '/images/ingredients/vitamin-c.jpeg',
    benefits: ['tvorba kolagénu', 'antioxidanty', 'podpora imunity']
  },
  {
    name: 'Kyselina hyaluronová',
    slug: 'kyselina-hyaluronova',
    description: 'Prirodzená zlúčenina pre hydratáciu a mazanie kĺbov',
    image: '/images/ingredients/kyselina-hyaluronova.jpeg',
    benefits: ['mazanie kĺbov', 'hydratácia', 'pohyblivosť']
  },
  {
    name: 'Boswellia serrata',
    slug: 'boswellia-serata',
    description: 'Ayurvédska rastlina s výraznými protizápalovými vlastnosťami',
    image: '/images/ingredients/boswellia-serata.jpeg',
    benefits: ['protizápalové účinky', 'zmierňovanie bolesti', 'podpora kĺbov']
  }
];

const INGREDIENT_CATEGORIES = {
  'joint-support': ['glukozamin', 'chondroitin', 'kolagen', 'kyselina-hyaluronova'],
  'anti-inflammatory': ['kurkuma', 'boswellia-serata', 'msm'],
  'cartilage-health': ['glukozamin', 'chondroitin', 'kolagen', 'vitamin-c'],
  'all': INGREDIENTS.map(i => i.slug)
};

export default function RelatedIngredients({ 
  currentIngredient, 
  category = 'all', 
  maxItems = 4,
  title 
}: RelatedIngredientsProps) {
  const categoryIngredients = INGREDIENT_CATEGORIES[category] || INGREDIENT_CATEGORIES.all;
  
  const filteredIngredients = INGREDIENTS
    .filter(ingredient => 
      categoryIngredients.includes(ingredient.slug) && 
      ingredient.slug !== currentIngredient
    )
    .slice(0, maxItems);

  if (filteredIngredients.length === 0) return null;

  const sectionTitle = title || getDefaultTitle(category);

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 my-12 border border-green-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {sectionTitle}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Objavte ďalšie prírodné zložky, ktoré podporujú zdravie vašich kĺbov a doplňujú účinky našej výživy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIngredients.map((ingredient) => (
          <article 
            key={ingredient.slug}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={ingredient.image}
                alt={ingredient.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
                {ingredient.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {ingredient.description}
              </p>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {ingredient.benefits.slice(0, 2).map((benefit, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                  {ingredient.benefits.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{ingredient.benefits.length - 2}
                    </span>
                  )}
                </div>
              </div>
              
              <Link
                href={`/zlozenie/${ingredient.slug}`}
                className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors group/link"
              >
                Zistiť viac
                <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {category !== 'all' && (
        <div className="text-center mt-8">
          <Link
            href="/zlozenie"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Zobraziť všetky zložky
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}
    </section>
  );
}

function getDefaultTitle(category: string): string {
  const titles = {
    'joint-support': 'Ďalšie zložky pre podporu kĺbov',
    'anti-inflammatory': 'Protizápalové prírodné zložky',
    'cartilage-health': 'Zložky pre zdravie chrupavky',
    'all': 'Súvisiace prírodné zložky'
  };

  return titles[category as keyof typeof titles] || titles.all;
} 