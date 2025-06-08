'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Users, Clock, TrendingUp } from 'lucide-react';

interface ContentItem {
  title: string;
  href: string;
  type: 'ingredient' | 'product' | 'blog' | 'guide';
  description?: string;
  image?: string;
  readTime?: string;
  popularity?: 'high' | 'medium' | 'low';
  isNew?: boolean;
}

interface ContentHubProps {
  topic: string;
  title?: string;
  description?: string;
  items: ContentItem[];
  showImages?: boolean;
  layout?: 'grid' | 'list';
  maxItems?: number;
  className?: string;
}

const TYPE_CONFIG = {
  ingredient: {
    label: 'Zložka',
    color: 'bg-green-100 text-green-700',
    icon: '🌿'
  },
  product: {
    label: 'Produkt',
    color: 'bg-blue-100 text-blue-700',
    icon: '🛒'
  },
  blog: {
    label: 'Článok',
    color: 'bg-purple-100 text-purple-700',
    icon: '📖'
  },
  guide: {
    label: 'Sprievodca',
    color: 'bg-orange-100 text-orange-700',
    icon: '📋'
  }
};

const POPULARITY_ICONS = {
  high: <TrendingUp className="w-4 h-4 text-red-500" />,
  medium: <Users className="w-4 h-4 text-yellow-500" />,
  low: null
};

export default function ContentHub({
  topic,
  title,
  description,
  items,
  showImages = true,
  layout = 'grid',
  maxItems = 8,
  className = ''
}: ContentHubProps) {
  const displayItems = items.slice(0, maxItems);
  
  if (displayItems.length === 0) return null;

  const gridClasses = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-4';

  const defaultTitle = `Všetko o téme: ${topic}`;
  const defaultDescription = `Kompletný prehľad informácií, produktov a článkov súvisiacich s témou ${topic.toLowerCase()}.`;

  const ContentCard = ({ item }: { item: ContentItem }) => {
    const typeConfig = TYPE_CONFIG[item.type];
    const popularityIcon = item.popularity ? POPULARITY_ICONS[item.popularity] : null;

    if (layout === 'list') {
      return (
        <article className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            {showImages && item.image && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeConfig.color}`}>
                  {typeConfig.icon} {typeConfig.label}
                </span>
                {item.isNew && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                    NOVÉ
                  </span>
                )}
                {popularityIcon}
              </div>
              
              <Link href={item.href} className="group">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </Link>
              
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                {item.readTime && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.readTime}
                  </span>
                )}
                
                <Link
                  href={item.href}
                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center group"
                >
                  Čítať viac
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {showImages && item.image && (
          <div className="relative aspect-video overflow-hidden">
            <Link href={item.href}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeConfig.color}`}>
                {typeConfig.icon} {typeConfig.label}
              </span>
              {item.isNew && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                  NOVÉ
                </span>
              )}
            </div>
            {popularityIcon && (
              <div className="absolute top-3 right-3 bg-white rounded-full p-1">
                {popularityIcon}
              </div>
            )}
          </div>
        )}
        
        <div className="p-6">
          <Link href={item.href} className="group/title">
            <h3 className="font-bold text-lg mb-2 group-hover/title:text-green-600 transition-colors line-clamp-2">
              {item.title}
            </h3>
          </Link>
          
          {item.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {item.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {item.readTime && (
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {item.readTime}
              </span>
            )}
            
            <Link
              href={item.href}
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center group/link"
            >
              Zobraziť
              <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 my-12 border border-gray-200 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {title || defaultTitle}
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          {description || defaultDescription}
        </p>
      </div>

      <div className={gridClasses}>
        {displayItems.map((item, index) => (
          <ContentCard key={index} item={item} />
        ))}
      </div>

      {items.length > maxItems && (
        <div className="text-center mt-8">
          <Link
            href={`/blog?search=${encodeURIComponent(topic)}`}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Zobraziť všetky ({items.length})
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}
    </section>
  );
}

// Pre-defined content hubs for common topics
export const JOINT_HEALTH_HUB: ContentItem[] = [
  {
    title: 'Glukozamín - stavebný kameň chrupavky',
    href: '/zlozenie/glukozamin',
    type: 'ingredient',
    description: 'Prírodná látka pre zdravie a regeneráciu kĺbovej chrupavky',
    image: '/images/ingredients/glukozamin.jpeg',
    readTime: '5 min',
    popularity: 'high',
    isNew: false
  },
  {
    title: 'Najsilnejšia kĺbová výživa',
    href: '/kupit',
    type: 'product',
    description: 'Komplexný doplnok s 9 prírodných zložiek pre zdravé kĺby',
    image: '/images/product-main.jpg',
    readTime: '2 min',
    popularity: 'high',
    isNew: false
  },
  {
    title: 'Chondroitín a jeho úloha v kĺboch',
    href: '/zlozenie/chondroitin',
    type: 'ingredient',
    description: 'Kľúčová zložka pre integritu kĺbového tkaniva',
    image: '/images/ingredients/chondroitin.jpeg',
    readTime: '4 min',
    popularity: 'high'
  },
  {
    title: 'Kolagén pre pevné kĺby',
    href: '/zlozenie/kolagen',
    type: 'ingredient',
    description: 'Najdôležitejší protein pre štruktúru kĺbov',
    image: '/images/ingredients/kolagen.jpeg',
    readTime: '6 min',
    popularity: 'medium'
  }
];

export const ANTI_INFLAMMATORY_HUB: ContentItem[] = [
  {
    title: 'Kurkuma - zlaté korenie proti zápalom',
    href: '/zlozenie/kurkuma',
    type: 'ingredient',
    description: 'Tradičné korenie s výraznými protizápalovými účinkami',
    image: '/images/ingredients/kurkuma.jpeg',
    readTime: '5 min',
    popularity: 'high'
  },
  {
    title: 'Boswellia serrata - ayurvédsky poklad',
    href: '/zlozenie/boswellia-serata',
    type: 'ingredient',
    description: 'Rastlina s výnimočnými protizápalovými vlastnosťami',
    image: '/images/ingredients/boswellia-serata.jpeg',
    readTime: '6 min',
    popularity: 'medium'
  },
  {
    title: 'MSM - organická síra pre kĺby',
    href: '/zlozenie/msm',
    type: 'ingredient',
    description: 'Prírodný zdroj síry pre podporu kĺbového zdravia',
    image: '/images/ingredients/msm.jpeg',
    readTime: '4 min',
    popularity: 'medium'
  }
]; 