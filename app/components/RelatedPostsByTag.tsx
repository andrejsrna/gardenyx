import Image from 'next/image';
import Link from 'next/link';
import { WordPressPost, getPaginatedPosts, getTagBySlug } from '../lib/wordpress';

interface RelatedPostsByTagProps {
  tagSlug: string;
  title?: string;
  maxPosts?: number;
}

const getGridClasses = (postCount: number): string => {
  const baseClasses = 'grid grid-cols-1 gap-6';
  
  if (postCount === 2) {
    return `${baseClasses} sm:grid-cols-2 lg:max-w-4xl lg:mx-auto`;
  }
  
  if (postCount >= 3) {
    return `${baseClasses} sm:grid-cols-2 lg:grid-cols-3`;
  }
  
  return baseClasses;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getPostCountText = (count: number): string => {
  if (count === 1) return 'článok';
  if (count >= 2 && count <= 4) return 'články';
  return 'článkov';
};

const PostCard = ({ post }: { post: WordPressPost }) => {
  const slug = post.slug || post.link.split('/').filter(Boolean).pop() || '';
  const href = slug.startsWith('/') ? slug : `/${slug}`;
  const formattedDate = formatDate(post.date);
  const hasFeaturedImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
      {hasFeaturedImage && (
        <Link href={href} aria-label={`Prečítať článok ${post.title.rendered}`}>
          <div className="relative h-48 w-full">
            <Image
              src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''}
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
          <Link href={href} className="hover:text-green-600 transition-colors line-clamp-2">
            <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          </Link>
        </h3>
        <Link
          href={href}
          className="mt-auto inline-flex items-center text-green-700 font-medium hover:underline self-start"
          aria-label={`Pokračovať v čítaní ${post.title.rendered}`}
        >
          Čítať článok <span className="ml-1" aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};

async function RelatedPostsByTag({ tagSlug, title, maxPosts = 6 }: RelatedPostsByTagProps) {
  const tag = await getTagBySlug(tagSlug);
  if (!tag) return null;

  const { posts, totalPosts } = await getPaginatedPosts({ tags: tag.id, page: 1 });
  const relatedPosts = posts.slice(0, maxPosts);
  const hasMorePosts = totalPosts > maxPosts;

  if (relatedPosts.length === 0) return null;

  const sectionTitle = title || `Články o ${tag.name}`;
  const gridClasses = getGridClasses(relatedPosts.length);

  return (
    <section className="my-16 bg-gray-50 py-12 px-4 rounded-xl border border-gray-200">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 text-center">{sectionTitle}</h2>
        <div className={gridClasses}>
          {relatedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {hasMorePosts && (
          <div className="mt-8 text-center">
            <Link
              href={`/blog?tag=${tagSlug}`}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              aria-label={`Zobraziť všetky články o ${tag.name}`}
            >
              Zobraziť všetky články o {tag.name}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-gray-600 mt-2">
              Našli sme {totalPosts} {getPostCountText(totalPosts)} s touto témou
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default RelatedPostsByTag;
