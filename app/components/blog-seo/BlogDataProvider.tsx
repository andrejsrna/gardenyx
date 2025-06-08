import { 
  getRelatedBlogPosts, 
  detectPostCategory, 
  type BlogPost 
} from '../../lib/blog-data';
import RelatedBlogPosts from './RelatedBlogPosts';

interface BlogDataProviderProps {
  currentPostId: number;
  postTitle: string;
  postContent?: string;
  postExcerpt?: string;
  maxPosts?: number;
  layout?: 'grid' | 'list';
  className?: string;
}

export default async function BlogDataProvider({
  currentPostId,
  postTitle,
  postContent = '',
  postExcerpt = '',
  maxPosts = 6,
  layout = 'grid',
  className = ''
}: BlogDataProviderProps) {
  // Detect category from post content
  const categorySlug = detectPostCategory({
    title: postTitle,
    content: postContent,
    excerpt: postExcerpt
  });

  // Fetch related posts from WordPress API
  let relatedPosts: BlogPost[] = [];
  
  try {
    relatedPosts = await getRelatedBlogPosts(
      currentPostId,
      maxPosts,
      'latest',
      categorySlug
    );
  } catch (error) {
    console.error('Error fetching related posts:', error);
    // getRelatedBlogPosts already handles fallbacks internally
  }

  return (
    <RelatedBlogPosts
      posts={relatedPosts}
      currentPostId={currentPostId}
      title="Súvisiace články"
      maxPosts={maxPosts}
      layout={layout}
      showCategories={true}
      showReadTime={true}
      className={className}
    />
  );
} 