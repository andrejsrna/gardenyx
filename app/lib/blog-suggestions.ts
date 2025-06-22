export interface ContentSuggestion {
  type: 'ingredient' | 'product' | 'blog' | 'guide';
  title: string;
  href: string;
  description: string;
  isHighPriority?: boolean;
  ctaText?: string;
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