import Image from 'next/image';
import Link from 'next/link';
import { WordPressPost, getPaginatedPosts, getTagBySlug } from '../lib/wordpress';

interface RelatedPostsByTagProps {
  tagSlug: string;
  title?: string;
  maxPosts?: number;
}

async function RelatedPostsByTag({ tagSlug, title, maxPosts = 3 }: RelatedPostsByTagProps) {
  const tag = await getTagBySlug(tagSlug);

  if (!tag) {
    // console.warn(`RelatedPostsByTag: Tag with slug "${tagSlug}" not found.`);
    return null; // Don't render if tag not found
  }

  // Fetch posts, request one more than maxPosts to check if there would be more
  const { posts } = await getPaginatedPosts({ tags: tag.id, page: 1 }); // Ensure we fetch enough

  const relatedPosts = posts.slice(0, maxPosts); // Apply the limit

  if (relatedPosts.length === 0) {
    return null; // Don't render if no posts found
  }

  const sectionTitle = title || `Články o ${tag.name}`;

  // Determine grid classes based on the number of posts
  let gridClasses = 'grid grid-cols-1 gap-6'; // Default for mobile and single post
  if (relatedPosts.length === 2) {
    gridClasses += ' sm:grid-cols-2 lg:max-w-4xl lg:mx-auto'; // 2 columns on SM+, centered large layout
  } else if (relatedPosts.length >= 3) {
    gridClasses += ' sm:grid-cols-2 lg:grid-cols-3'; // 1 on mobile, 2 on SM+, 3 on LG+
  }

  return (
    <section className="my-16 bg-gray-50 py-12 px-4 rounded-xl border border-gray-200">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 text-center">{sectionTitle}</h2>
        <div className={gridClasses}>
          {relatedPosts.map((post: WordPressPost) => {
            const slug = post.link.split('/').filter(Boolean).pop();
            const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <article
                key={post.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-lg ${relatedPosts.length === 1 ? 'max-w-lg mx-auto' : ''}`}
              >
                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                  <Link href={`/${slug}`} aria-label={`Prečítať článok ${post.title.rendered}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={post._embedded['wp:featuredmedia'][0].source_url}
                        alt={post.title.rendered}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <time dateTime={post.date} className="text-sm text-gray-500 mb-2 block">
                    {formattedDate}
                  </time>
                  <h3 className="text-lg font-semibold mb-3 flex-grow">
                    <Link href={`/${slug}`} className="hover:text-green-600 transition-colors line-clamp-2">
                      <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    </Link>
                  </h3>
                  <Link
                    href={`/${slug}`}
                    className="mt-auto inline-flex items-center text-green-700 font-medium hover:underline self-start"
                    aria-label={`Pokračovať v čítaní ${post.title.rendered}`}
                  >
                    Čítať článok <span className="ml-1" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RelatedPostsByTag;
