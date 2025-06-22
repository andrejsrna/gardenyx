'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, TrendingUp, Star } from 'lucide-react';
import type { BlogPost } from '../../lib/blog-data';

interface RelatedBlogPostsProps {
  posts: BlogPost[];
  currentPostId: number;
  title?: string;
  maxPosts?: number;
  layout?: 'grid' | 'list';
  showCategories?: boolean;
  showReadTime?: boolean;
  className?: string;
}

export default function RelatedBlogPosts({
  posts,
  currentPostId,
  title = 'Súvisiace články',
  maxPosts = 6,
  layout = 'grid',
  showCategories = true,
  showReadTime = true,
  className = ''
}: RelatedBlogPostsProps) {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, maxPosts);

  if (relatedPosts.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const layoutClasses = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-3';

  const PostCard = ({ post }: { post: BlogPost }) => {
    if (layout === 'list') {
      return (
        <Link 
          href={`/${post.slug}`} 
          className="flex justify-between items-center p-4 rounded-lg bg-white hover:bg-green-50 border border-gray-200 transition-colors group"
        >
          <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
            {post.title}
          </h3>
          {post.readTime && showReadTime && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 ml-4">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime} min</span>
            </div>
          )}
        </Link>
      );
    }

    return (
      <article className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {post.featuredImage && (
          <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
            <Link href={`/${post.slug}`}>
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 text-6xl">🌿</div>';
                  }
                }}
              />
            </Link>
            <div className="absolute top-3 left-3 flex gap-2">
              {post.category && showCategories && (
                <span className="text-xs bg-white/90 text-green-700 px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                  {post.category}
                </span>
              )}
              {post.isPopular && (
                <div className="bg-white/90 rounded-full p-1 backdrop-blur-sm" title="Populárny článok">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="p-4 flex flex-col flex-grow">
          <Link href={`/${post.slug}`} className="group/title">
            <h3 className="font-semibold text-base mb-2 group-hover/title:text-green-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          
          <div className="flex-grow"></div>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>{formatDate(post.date)}</span>
            {post.readTime && showReadTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime} min
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className={`bg-gray-50 rounded-2xl p-8 md:mt-0 mt-12 border border-gray-200 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
          <Star className="w-6 h-6 mr-2 text-green-600" />
          {title}
        </h2>
        <p className="text-gray-600 max-w-2xl">
          Objavte ďalšie užitočné články o zdraví kĺbov a prírodných doplnkoch výživy.
        </p>
      </div>

      <div className={layoutClasses}>
        {relatedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/blog"
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Zobraziť všetky články
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </section>
  );
} 