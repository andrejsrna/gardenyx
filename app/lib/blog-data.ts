import { decode } from 'html-entities';
import { 
  WordPressPost, 
  getRelatedPosts, 
  getLatestPosts, 
  getPopularPosts,
  getPostsByCategory
} from './content';

// Blog post interface that matches our components
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

// Transform WordPress post to our BlogPost format
export function transformWordPressPost(wpPost: WordPressPost): BlogPost {
  // Calculate read time based on content length
  const contentText = wpPost.content.rendered.replace(/<[^>]*>/g, '');
  const wordCount = contentText.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Extract featured image
  const featuredImage = wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  // Get first category name (WordPress embeds categories in wp:term[0])
  const embedded = wpPost._embedded as Record<string, unknown> | undefined;
  const termData = embedded?.['wp:term'] as Array<Array<{ id: number; name: string; slug: string }>> | undefined;
  const categories = termData?.[0] || [];
  const category = categories.length > 0 ? categories[0].name : undefined;

  // Get tags (WordPress embeds tags in wp:term[1])  
  const wpTags = termData?.[1] || [];
  const tags = wpTags.map((tag) => tag.name);

  // Clean up title and excerpt, decode HTML entities
  const title = decode(wpPost.title.rendered.replace(/<[^>]*>/g, ''));
  const excerpt = decode(wpPost.excerpt.rendered.replace(/<[^>]*>/g, '')).trim();

  return {
    id: wpPost.id,
    title,
    slug: wpPost.slug,
    excerpt,
    date: wpPost.date,
    featuredImage,
    readTime,
    category,
    tags,
    isPopular: false // We'll set this based on comment count or views if available
  };
}

// Get related blog posts for a specific post
export async function getRelatedBlogPosts(
  currentPostId: number,
  limit: number = 6,
  fallbackStrategy: 'latest' | 'popular' | 'category' = 'latest',
  categorySlug?: string
): Promise<BlogPost[]> {
  try {
    // Try to get related posts first
    let wpPosts: WordPressPost[] = [];
    
    // Try category-based related posts if category is provided
    if (categorySlug) {
      wpPosts = await getPostsByCategory(categorySlug, limit);
    }
    
    // If no category posts or not enough, try general related posts
    if (wpPosts.length < limit) {
      const remainingCount = limit - wpPosts.length;
      const additionalPosts = await getRelatedPosts(String(currentPostId), remainingCount);
      wpPosts = [...wpPosts, ...additionalPosts];
    }

    // If still not enough posts, use fallback strategy
    if (wpPosts.length < limit) {
      const remainingCount = limit - wpPosts.length;
      let fallbackPosts: WordPressPost[] = [];

      switch (fallbackStrategy) {
        case 'popular':
          fallbackPosts = await getPopularPosts(remainingCount);
          break;
        case 'latest':
        default:
          fallbackPosts = await getLatestPosts(remainingCount);
          break;
      }

      // Filter out current post and already included posts
      const existingIds = wpPosts.map(p => p.id);
      fallbackPosts = fallbackPosts.filter(
        post => post.id !== currentPostId && !existingIds.includes(post.id)
      );

      wpPosts = [...wpPosts, ...fallbackPosts];
    }

    // Transform to BlogPost format and limit results
    const blogPosts = wpPosts.slice(0, limit).map(transformWordPressPost);

    // Mark popular posts (those with more comments)
    return blogPosts.map(post => ({
      ...post,
      isPopular: Math.random() > 0.7 // Temporary: mark random posts as popular
    }));

  } catch (error) {
    console.error('Error fetching related blog posts:', error);
    return getFallbackBlogPosts(limit);
  }
}

// Get latest blog posts
export async function getLatestBlogPosts(limit: number = 6): Promise<BlogPost[]> {
  try {
    const wpPosts = await getLatestPosts(limit);
    return wpPosts.map(transformWordPressPost);
  } catch (error) {
    console.error('Error fetching latest blog posts:', error);
    return getFallbackBlogPosts(limit);
  }
}

// Fallback blog posts if API fails
function getFallbackBlogPosts(limit: number = 6): BlogPost[] {
  const fallbackPosts: BlogPost[] = [
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

  return fallbackPosts.slice(0, limit);
}

// Helper function to extract category slug from post content or title
export function detectPostCategory(post: { title: string; content?: string; excerpt?: string }): string | undefined {
  const content = `${post.title} ${post.content || ''} ${post.excerpt || ''}`.toLowerCase();
  
  // Map keywords to category slugs
  const categoryMap: Record<string, string> = {
    'glukozamín': 'ingrediencie',
    'chondroitín': 'ingrediencie',
    'kolagén': 'ingrediencie',
    'kurkuma': 'ingrediencie',
    'msm': 'ingrediencie',
    'cvičenie': 'cvicenie',
    'strava': 'vyziva',
    'výživa': 'vyziva',
    'bolesť': 'zdravie',
    'mýtus': 'myty-a-fakty',
    'tip': 'rady-a-tipy'
  };

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (content.includes(keyword)) {
      return category;
    }
  }

  return 'zdravie'; // Default category
} 
