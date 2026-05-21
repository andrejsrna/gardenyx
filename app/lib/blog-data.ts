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

export async function getRelatedBlogPosts(
  _currentPostId?: number,
  _limit?: number,
  _fallbackStrategy?: 'latest' | 'popular' | 'category',
  _categorySlug?: string
): Promise<BlogPost[]> {
  return [];
}

export async function getLatestBlogPosts(_limit?: number): Promise<BlogPost[]> {
  return [];
}

export function detectPostCategory(_post?: { title: string; content?: string; excerpt?: string }): string | undefined {
  return undefined;
}
