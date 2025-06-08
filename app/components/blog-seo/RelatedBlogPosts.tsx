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
    : 'space-y-6';

  const PostCard = ({ post }: { post: BlogPost }) => {
    if (layout === 'list') {
      return (
        <article className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex gap-6">
            {post.featuredImage && (
              <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <Link href={`/${post.slug}`}>
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="128px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 text-2xl">🌿</div>';
                      }
                    }}
                  />
                </Link>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {post.category && showCategories && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {post.category}
                  </span>
                )}
                {post.isPopular && (
                  <div className="flex items-center text-orange-500" title="Populárny článok">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <Link href={`/${post.slug}`} className="group/title">
                <h3 className="font-bold text-lg mb-2 group-hover/title:text-green-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(post.date)}</span>
                {post.readTime && showReadTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} min
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
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
        
        <div className="p-6">
          <Link href={`/${post.slug}`} className="group/title">
            <h3 className="font-bold text-lg mb-3 group-hover/title:text-green-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>{formatDate(post.date)}</span>
            {post.readTime && showReadTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime} min
              </div>
            )}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                >
                  {tag}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          <Link
            href={`/${post.slug}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors group/link"
          >
            Čítať článok
            <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </article>
    );
  };

  return (
    <section className={`bg-gray-50 rounded-2xl p-8 my-12 border border-gray-200 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
          <Star className="w-6 h-6 mr-2 text-green-600" />
          {title}
        </h2>
        <p className="text-gray-600">
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