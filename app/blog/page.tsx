import Link from 'next/link';
import Image from 'next/image';
import { getPaginatedPosts } from '../lib/wordpress';
import type { WordPressPost } from '../lib/wordpress';
import { Metadata } from 'next';
import { getRankMathSEO } from '../lib/wordpress';
import { parseHTML } from '../lib/html-parser';

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  // Get RankMath SEO data for blog page
  const seoData = await getRankMathSEO('https://najsilnejsiaklbovavyziva.sk/blog');
  
  if (!seoData) {
    // Fallback metadata if RankMath data is not available
    return {
      title: 'Blog o kĺbovej výžive | Najsilnejšia kĺbová výživa',
      description: 'Prečítajte si najnovšie články o kĺbovej výžive, zdraví kĺbov a pohybového aparátu. Odborné informácie a praktické rady.',
      openGraph: {
        title: 'Blog o kĺbovej výžive | Najsilnejšia kĺbová výživa',
        description: 'Prečítajte si najnovšie články o kĺbovej výžive, zdraví kĺbov a pohybového aparátu. Odborné informácie a praktické rady.',
        url: 'https://najsilnejsiaklbovavyziva.sk/blog',
        siteName: 'Najsilnejšia kĺbová výživa',
        images: [
          {
            url: 'https://najsilnejsiaklbovavyziva.sk/og-image.jpg',
            width: 1200,
            height: 630,
          },
        ],
        locale: 'sk_SK',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Blog o kĺbovej výžive | Najsilnejšia kĺbová výživa',
        description: 'Prečítajte si najnovšie články o kĺbovej výžive, zdraví kĺbov a pohybového aparátu. Odborné informácie a praktické rady.',
        images: ['https://najsilnejsiaklbovavyziva.sk/og-image.jpg'],
      },
      alternates: {
        canonical: 'https://najsilnejsiaklbovavyziva.sk/blog',
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  // Parse the head HTML using our utility
  const parser = parseHTML(seoData.head);
  
  return {
    title: parser.getTitle(),
    description: parser.getMetaTag('description'),
    openGraph: {
      title: parser.getMetaTag('og:title'),
      description: parser.getMetaTag('og:description'),
      url: parser.getMetaTag('og:url'),
      siteName: parser.getMetaTag('og:site_name'),
      images: parser.getMetaTag('og:image') 
        ? [{
            url: parser.getMetaTag('og:image') || '',
            width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
            height: parseInt(parser.getMetaTag('og:image:height') || '630'),
          }]
        : [],
      locale: 'sk_SK',
      type: (parser.getMetaTag('og:type') || 'website') as 'website' | 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: parser.getMetaTag('twitter:title'),
      description: parser.getMetaTag('twitter:description'),
      images: parser.getMetaTag('twitter:image') 
        ? [{
            url: parser.getMetaTag('twitter:image') || '',
          }]
        : [],
    },
    alternates: {
      canonical: parser.getCanonical() || 'https://najsilnejsiaklbovavyziva.sk/blog',
    },
    robots: {
      index: parser.getRobots()?.includes('noindex') ? false : true,
      follow: parser.getRobots()?.includes('nofollow') ? false : true,
    },
  };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.search || '';
  
  const { posts, totalPages, totalPosts } = await getPaginatedPosts({
    page: currentPage,
    search: searchQuery,
  });

  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-600 mb-8">
            {searchQuery 
              ? `Výsledky vyhľadávania pre "${searchQuery}" (${totalPosts})`
              : `Všetky články o zdraví kĺbov (${totalPosts})`
            }
          </p>

          <form 
            action="/blog" 
            method="get" 
            className="max-w-2xl mx-auto flex gap-4"
          >
            <div className="flex-1">
              <input
                type="search"
                name="search"
                placeholder="Vyhľadať články..."
                defaultValue={searchQuery}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Hľadať
            </button>
            {searchQuery && (
              <Link
                href="/blog"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Zrušiť
              </Link>
            )}
          </form>
        </header>

        {posts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {posts.map((post: WordPressPost) => {
              const slug = post.link.split('/').filter(Boolean).pop();
              const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                    <Link href={`/${slug}`}>
                      <div className="relative h-48">
                        <Image
                          src={post._embedded['wp:featuredmedia'][0].source_url}
                          alt={post.title.rendered}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="p-6">
                    <time className="text-sm text-gray-500 mb-2 block">
                      {formattedDate}
                    </time>
                    <h2 className="text-xl font-semibold mb-2">
                      <Link href={`/${slug}`} className="hover:text-green-600 transition-colors">
                        <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      </Link>
                    </h2>
                    <div 
                      className="text-gray-600 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    />
                    <Link 
                      href={`/${slug}`}
                      className="text-green-600 font-medium hover:underline inline-flex items-center"
                    >
                      Čítať viac <span className="ml-1">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery 
                ? `Žiadne články sa nenašli pre "${searchQuery}"`
                : 'Žiadne články nie sú k dispozícii'
              }
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Predchádzajúca
              </Link>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/blog?page=${pageNum}${searchQuery ? `&search=${searchQuery}` : ''}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  pageNum === currentPage
                    ? 'bg-green-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Ďalšia →
              </Link>
            )}
          </nav>
        )}
      </div>
    </main>
  );
} 