import Link from 'next/link';
import { getLatestPosts } from '../lib/wordpress';
import type { WordPressPost } from '../lib/wordpress';
import FeaturedImageWithFallback from './FeaturedImageWithFallback';

export default async function RecentPosts() {
  const posts = await getLatestPosts(3);

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Najnovšie články</h2>
          <p className="text-gray-600">Prečítajte si naše najnovšie príspevky o zdraví kĺbov</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {posts.map((post: WordPressPost, index: number) => {
            const slug = post.slug || post.link.split('/').filter(Boolean).pop() || '';
            const href = slug.startsWith('/') ? slug : `/${slug}`;
            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            const isPriority = index === 0;

            return (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link href={href}>
                  <div className="relative h-48 overflow-hidden">
                    <FeaturedImageWithFallback
                      src={featuredImage}
                      alt={post.title.rendered}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      priority={isPriority}
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    <Link href={href} className="hover:text-green-600 transition-colors">
                      <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    </Link>
                  </h3>
                  <div 
                    className="text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                  <Link 
                    href={href}
                    className="text-green-600 font-medium hover:underline inline-flex items-center"
                  >
                    Čítať viac <span className="ml-1">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Zobraziť všetky články <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
} 
