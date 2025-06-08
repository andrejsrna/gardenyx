interface ContextualLink {
  text: string;
  href: string;
  type: 'internal' | 'external' | 'product' | 'blog';
  description?: string;
  isHighPriority?: boolean;
}

interface BreadcrumbItem {
  name: string;
  href: string;
  description?: string;
}

// Contextual links data for ingredients
export const INGREDIENT_CONTEXTUAL_LINKS = {
  glukozamin: [
    {
      text: 'Chondroitín - ideálny partner',
      href: '/zlozenie/chondroitin',
      type: 'internal' as const,
      description: 'Kombinujte glukozamín s chondroitínom pre maximálnu účinnosť',
      isHighPriority: true
    },
    {
      text: 'Kúpiť najsilnejšiu kĺbovú výživu',
      href: '/kupit',
      type: 'product' as const,
      description: 'Obsahuje glukozamín v optimálnom dávkovaní',
      isHighPriority: true
    },
    {
      text: 'Všetky články o glukozamíne',
      href: '/blog?tag=glukozamin',
      type: 'blog' as const,
      description: 'Prečítajte si najnovšie poznatky a štúdie'
    }
  ],
  chondroitin: [
    {
      text: 'Glukozamín - synergický účinok',
      href: '/zlozenie/glukozamin',
      type: 'internal' as const,
      description: 'Chondroitín a glukozamín sa navzájom podporujú',
      isHighPriority: true
    },
    {
      text: 'Objednať kĺbovú výživu',
      href: '/kupit',
      type: 'product' as const,
      description: 'Vysoká koncentrácia chondroitínu v našom produkte'
    }
  ],
  msm: [
    {
      text: 'Kurkuma - protizápalová kombinácia',
      href: '/zlozenie/kurkuma',
      type: 'internal' as const,
      description: 'MSM a kurkuma spolupracujú proti zápalom',
      isHighPriority: true
    },
    {
      text: 'Boswellia serrata',
      href: '/zlozenie/boswellia-serata',
      type: 'internal' as const,
      description: 'Ďalšia silná protizápalová zložka'
    }
  ],
  kolagen: [
    {
      text: 'Vitamín C pre kolagén',
      href: '/zlozenie/vitamin-c',
      type: 'internal' as const,
      description: 'Vitamín C je nevyhnutný pre tvorbu kolagénu',
      isHighPriority: true
    },
    {
      text: 'Kyselina hyaluronová',
      href: '/zlozenie/kyselina-hyaluronova',
      type: 'internal' as const,
      description: 'Doplňuje kolagén pre zdravé kĺby'
    }
  ]
};

// Helper function to get contextual links for specific ingredient
export function getIngredientContextualLinks(ingredient: string): ContextualLink[] {
  return INGREDIENT_CONTEXTUAL_LINKS[ingredient as keyof typeof INGREDIENT_CONTEXTUAL_LINKS] || [];
}

// Helper functions for breadcrumb patterns
export function getIngredientBreadcrumbs(ingredientName: string, ingredientSlug: string): BreadcrumbItem[] {
  return [
    { 
      name: 'Zloženie', 
      href: '/zlozenie',
      description: 'Všetky prírodné zložky našej kĺbovej výživy'
    },
    { 
      name: ingredientName, 
      href: `/zlozenie/${ingredientSlug}`,
      description: `Detailné informácie o ${ingredientName.toLowerCase()}`
    }
  ];
}

export function getProductBreadcrumbs(productName: string, productSlug: string): BreadcrumbItem[] {
  return [
    { 
      name: 'Obchod', 
      href: '/kupit',
      description: 'Všetky naše kĺbové výživy a doplnky'
    },
    { 
      name: productName, 
      href: `/produkt/${productSlug}`,
      description: `Detaily produktu ${productName}`
    }
  ];
}

export function getBlogBreadcrumbs(postTitle: string, postSlug: string): BreadcrumbItem[] {
  return [
    { 
      name: 'Blog', 
      href: '/blog',
      description: 'Články o zdraví kĺbov a výžive'
    },
    { 
      name: postTitle, 
      href: `/${postSlug}`,
      description: `Článok: ${postTitle}`
    }
  ];
}

// Content suggestions for blog posts
interface ContentSuggestion {
  type: 'ingredient' | 'product' | 'blog' | 'guide';
  title: string;
  href: string;
  description: string;
  isHighPriority?: boolean;
  ctaText?: string;
}

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
    type: 'blog',
    title: 'Prírodné protizápalové potraviny',
    href: '/blog/prirodne-protizapalove-potraviny',
    description: 'Zoznam potravín, ktoré prirodzene znižujú zápal v tele a podporujú zdravie kĺbov.',
    ctaText: 'Čítať článok'
  },
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
  },
  {
    type: 'blog',
    title: 'Vedecké štúdie o kĺboch',
    href: '/blog/vedecke-studie-klby',
    description: 'Prehľad najnovších výskumov v oblasti zdravia kĺbov a výživy.',
    ctaText: 'Zobraziť štúdie'
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

// Mock blog posts data for server-side
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  featuredImage?: string;
  readTime?: number;
  category?: string;
  isPopular?: boolean;
  tags?: string[];
}

export function getRelatedBlogPosts(): BlogPost[] {
  return [
    {
      id: 1,
      title: 'Ako si vybrať správny doplnok na kĺby: Kompletný sprievodca',
      slug: 'ako-si-vybrat-spravny-doplnok-na-klby',
      excerpt: 'Zistite, na čo si dať pozor pri výbere doplnkov výživy pre zdravé kĺby a ako rozpoznať kvalitné produkty.',
      date: '2024-01-15',
      featuredImage: '/images/landing/hero.jpeg',
      readTime: 7,
      category: 'Rady a tipy',
      isPopular: true,
      tags: ['výber doplnkov', 'kvalita', 'rady']
    },
    {
      id: 2,
      title: 'Glukozamín vs. Chondroitín: Ktorý je lepší pre vaše kĺby?',
      slug: 'glukozamin-vs-chondroitin-porovnanie',
      excerpt: 'Porovnanie dvoch najobľúbenejších zložiek pre zdravie kĺbov a ich synergických účinkov.',
      date: '2024-01-10',
      featuredImage: '/images/ingredients/glukozamin.jpeg',
      readTime: 5,
      category: 'Ingrediencie',
      tags: ['glukozamín', 'chondroitín', 'porovnanie']
    },
    {
      id: 3,
      title: '5 najčastejších mýtov o kĺbovej výžive',
      slug: '5-mytov-o-klbovej-vyzive',
      excerpt: 'Vyvrátenie najčastejších dezinformácií a mýtov o doplnkoch výživy pre kĺby.',
      date: '2024-01-05',
      featuredImage: '/images/ingredients/kurkuma.jpeg',
      readTime: 6,
      category: 'Mýty a fakty',
      isPopular: true,
      tags: ['mýty', 'fakty', 'vzdelávanie']
    },
    {
      id: 4,
      title: 'Prirodzené spôsoby zmierňovania kĺbovej bolesti',
      slug: 'prirodzene-sposoby-zmiernovanaia-klbovej-bolesti',
      excerpt: 'Efektívne metódy na úľavu od kĺbovej bolesti bez užívania liekov.',
      date: '2024-01-01',
      featuredImage: '/images/ingredients/boswellia-serata.jpeg',
      readTime: 8,
      category: 'Zdravie',
      tags: ['bolesť kĺbov', 'prírodné riešenia', 'úľava']
    },
    {
      id: 5,
      title: 'Vplyv stravy na zdravie kĺbov',
      slug: 'vplyv-stravy-na-zdravie-klbov',
      excerpt: 'Ako vaša strava ovplyvňuje zdravie kĺbov a ktoré potraviny konzumovať.',
      date: '2023-12-28',
      featuredImage: '/images/ingredients/vitamin-c.jpeg',
      readTime: 6,
      category: 'Výživa',
      tags: ['strava', 'výživa', 'prevencia']
    },
    {
      id: 6,
      title: 'Cvičenie pre zdravé kĺby: Komplexný sprievodca',
      slug: 'cvicenie-pre-zdrave-klby',
      excerpt: 'Najlepšie cviky na posilnenie kĺbov a udržanie ich mobility.',
      date: '2023-12-25',
      featuredImage: '/images/ingredients/msm.jpeg',
      readTime: 9,
      category: 'Cvičenie',
      isPopular: true,
      tags: ['cvičenie', 'mobilita', 'posilňovanie']
    }
  ];
} 