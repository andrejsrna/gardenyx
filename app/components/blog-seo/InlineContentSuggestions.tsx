'use client';

import Link from 'next/link';
import { ArrowRight, Lightbulb } from 'lucide-react';

interface ContentSuggestion {
  type: 'ingredient' | 'product' | 'blog' | 'guide';
  title: string;
  href: string;
  description: string;
  isHighPriority?: boolean;
  ctaText?: string;
}

interface InlineContentSuggestionsProps {
  suggestions: ContentSuggestion[];
  title?: string;
  layout?: 'compact' | 'detailed';
  className?: string;
}

const TYPE_CONFIG = {
  ingredient: {
    icon: '🌿',
    color: 'bg-green-50 border-green-200 text-green-800',
    accentColor: 'text-green-600'
  },
  product: {
    icon: '🛒',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    accentColor: 'text-blue-600'
  },
  blog: {
    icon: '📖',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    accentColor: 'text-purple-600'
  },
  guide: {
    icon: '📋',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    accentColor: 'text-orange-600'
  }
};

export default function InlineContentSuggestions({
  suggestions,
  title = 'Mohlo by vás zaujímať',
  layout = 'compact',
  className = ''
}: InlineContentSuggestionsProps) {
  if (suggestions.length === 0) return null;

  if (layout === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 my-8 border border-green-100 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const config = TYPE_CONFIG[suggestion.type];
            return (
              <Link
                key={index}
                href={suggestion.href}
                className={`block p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${config.color} ${
                  suggestion.isHighPriority ? 'ring-2 ring-green-300 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs opacity-75 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-8 my-12 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-green-600" />
        <h3 className="font-bold text-xl text-gray-900">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => {
          const config = TYPE_CONFIG[suggestion.type];
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-lg ${config.color} ${
                suggestion.isHighPriority ? 'ring-2 ring-green-300 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{config.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm opacity-90 mb-4">
                    {suggestion.description}
                  </p>
                  <Link
                    href={suggestion.href}
                    className={`inline-flex items-center font-medium text-sm transition-colors hover:underline ${config.accentColor}`}
                  >
                    {suggestion.ctaText || 'Zistiť viac'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Pre-defined suggestion sets for common blog topics
export const JOINT_HEALTH_SUGGESTIONS: ContentSuggestion[] = [
  {
    type: 'ingredient',
    title: 'Glukozamín pre zdravé kĺby',
    href: '/zlozenie/glukozamin',
    description: 'Zistite, ako glukozamín podporuje regeneráciu chrupavky a zmierňuje bolesť kĺbov.',
    isHighPriority: true,
    ctaText: 'Prečítať o glukozamíne'
  },
  {
    type: 'ingredient',
    title: 'Chondroitín a jeho účinky',
    href: '/zlozenie/chondroitin',
    description: 'Objavte, prečo je chondroitín kľúčový pre udržanie zdravej kĺbovej chrupavky.',
    ctaText: 'Viac o chondroitíne'
  },
  {
    type: 'product',
    title: 'Najsilnejšia kĺbová výživa',
    href: '/kupit',
    description: 'Komplexný doplnok s 9 prírodných zložiek pre optimálnu podporu vašich kĺbov.',
    isHighPriority: true,
    ctaText: 'Objednať teraz'
  }
];

export const NUTRITION_TIPS_SUGGESTIONS: ContentSuggestion[] = [
  {
    type: 'ingredient',
    title: 'Kurkuma proti zápalom',
    href: '/zlozenie/kurkuma',
    description: 'Zlaté korenie s výnimočnými protizápalovými vlastnosťami.',
    ctaText: 'Zistiť viac o kurkume'
  },
  {
    type: 'guide',
    title: 'Ako správne užívať doplnky',
    href: '/uzivanie',
    description: 'Praktický sprievodca pre maximálnu účinnosť vašich doplnkov výživy.',
    ctaText: 'Prečítať sprievodcu'
  }
];

export const INGREDIENT_SCIENCE_SUGGESTIONS: ContentSuggestion[] = [
  {
    type: 'ingredient',
    title: 'MSM - organická síra',
    href: '/zlozenie/msm',
    description: 'Vedecky podložené informácie o účinkoch MSM na zdravie kĺbov.',
    ctaText: 'Štúdie a výskum'
  },
  {
    type: 'ingredient',
    title: 'Kolagén pre pevné kĺby',
    href: '/zlozenie/kolagen',
    description: 'Ako kolagén podporuje štruktúru a funkciu kĺbového tkaniva.',
    ctaText: 'Prečítať o kolagéne'
  }
];

// Helper function to get suggestions based on content topic
export function getSuggestionsByTopic(topic: string): ContentSuggestion[] {
  const topicMap: Record<string, ContentSuggestion[]> = {
    'joint-health': JOINT_HEALTH_SUGGESTIONS,
    'nutrition-tips': NUTRITION_TIPS_SUGGESTIONS,
    'ingredient-science': INGREDIENT_SCIENCE_SUGGESTIONS
  };
  
  return topicMap[topic] || JOINT_HEALTH_SUGGESTIONS;
} 