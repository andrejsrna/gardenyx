import EnhancedArticleSchema from './EnhancedArticleSchema';
import RelatedBlogPosts from './RelatedBlogPosts';
import { BlogPost } from '../../lib/blog-data';
import InlineContentSuggestions, { getSuggestionsByTopic } from './InlineContentSuggestions';
import SmartBreadcrumbs from '../internal-linking/SmartBreadcrumbs';
import { getBlogBreadcrumbs } from '../../lib/internal-linking-data';
import { WordPressPost } from '../../lib/wordpress';

interface BlogPostEnhancementsProps {
  post: WordPressPost;
  readTime: number;
  wordCount: number;
  topic?: string;
  relatedPosts?: Array<{
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
  }>;
}

export default function BlogPostEnhancements({
  post,
  readTime,
  wordCount,
  topic = 'joint-health',
  relatedPosts = []
}: BlogPostEnhancementsProps) {
  // Generate breadcrumbs
  const breadcrumbs = getBlogBreadcrumbs(
    post.title.rendered.replace(/<[^>]*>/g, ''),
    post.slug
  );

  // Get inline suggestions based on topic
  const inlineSuggestions = getSuggestionsByTopic(topic);

  // Use provided related posts or empty array for now
  const postsToShow = relatedPosts || [];

  // Extract categories and tags from post (if available)
  const categories = ['Zdravie kĺbov']; // WordPress categories would need to be fetched separately
  const tags: string[] = []; // WordPress tags would need to be fetched separately

  return (
    <>
      {/* Enhanced Article Schema */}
      <EnhancedArticleSchema
        post={post}
        readTime={readTime}
        wordCount={wordCount}
        categories={categories}
        tags={tags}
        relatedArticles={postsToShow.slice(0, 3).map((p: BlogPost) => ({
          title: p.title,
          url: `/${p.slug}`
        }))}
      />

      {/* Smart Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <SmartBreadcrumbs 
          items={breadcrumbs} 
          showDescriptions={true}
          className="text-sm"
        />
      </div>

      {/* Inline Content Suggestions (to be inserted mid-article) */}
      <InlineContentSuggestions
        suggestions={inlineSuggestions}
        layout="compact"
        title="Súvisiace témy"
      />

      {/* Related Blog Posts */}
      <RelatedBlogPosts
        posts={postsToShow}
        currentPostId={post.id}
        title="Odporúčané články"
        maxPosts={6}
        layout="grid"
        showCategories={true}
        showReadTime={true}
      />
    </>
  );
}

// Helper function to determine topic from post content
export function detectPostTopic(post: WordPressPost): string {
  const content = (post.content.rendered + post.title.rendered).toLowerCase();
  
  if (content.includes('glukozamín') || content.includes('chondroitín') || content.includes('msm')) {
    return 'ingredient-science';
  }
  
  if (content.includes('výživa') || content.includes('strava') || content.includes('potraviny')) {
    return 'nutrition-tips';
  }
  
  return 'joint-health';
}

// SEO Meta improvements helper
export function generateBlogPostKeywords(post: WordPressPost): string[] {
  const title = post.title.rendered.replace(/<[^>]*>/g, '').toLowerCase();
  const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').toLowerCase();
  
  const baseKeywords = [
    'zdravie kĺbov',
    'kĺbová výživa', 
    'prírodné doplnky',
    'najsilnejšia kĺbová výživa'
  ];
  
  // Add ingredient-specific keywords if mentioned
  const ingredientKeywords = [];
  if (title.includes('glukozamín') || excerpt.includes('glukozamín')) {
    ingredientKeywords.push('glukozamín', 'chrupavka', 'osteoartritída');
  }
  if (title.includes('chondroitín') || excerpt.includes('chondroitín')) {
    ingredientKeywords.push('chondroitín', 'kĺbové tkanivo');
  }
  if (title.includes('kolagén') || excerpt.includes('kolagén')) {
    ingredientKeywords.push('kolagén', 'kĺbová štruktúra');
  }
  
  return [...baseKeywords, ...ingredientKeywords];
}

// Blog post reading experience enhancements
export function calculateReadingProgress(contentLength: number): {
  readTime: number;
  difficulty: 'easy' | 'medium' | 'advanced';
  estimatedCompletionRate: number;
} {
  const readTime = Math.ceil(contentLength / 200); // 200 words per minute
  
  let difficulty: 'easy' | 'medium' | 'advanced' = 'easy';
  let estimatedCompletionRate = 85;
  
  if (readTime > 10) {
    difficulty = 'advanced';
    estimatedCompletionRate = 60;
  } else if (readTime > 5) {
    difficulty = 'medium';  
    estimatedCompletionRate = 75;
  }
  
  return {
    readTime,
    difficulty,
    estimatedCompletionRate
  };
} 