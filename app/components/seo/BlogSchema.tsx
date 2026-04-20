import { WordPressPost } from '@/app/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';

interface BlogSchemaProps {
  posts: WordPressPost[];
  totalPosts: number;
  currentPage: number;
  pageTitle: string;
  pageDescription: string;
}

export default function BlogSchema({
  posts,
  totalPosts,
  currentPage,
  pageTitle,
  pageDescription,
}: BlogSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'GardenYX',
      url: SITE_URL,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title.rendered.replace(/(<([^>]+)>)/gi, ''),
      description: post.excerpt.rendered.replace(/(<([^>]+)>)/gi, ''),
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Organization',
        name: 'GardenYX',
      },
      publisher: {
        '@type': 'Organization',
        name: 'GardenYX',
      },
      ...(post._embedded?.['wp:featuredmedia']?.[0]?.source_url && {
        image: {
          '@type': 'ImageObject',
          url: post._embedded['wp:featuredmedia'][0].source_url,
          width: 1200,
          height: 630,
        },
      }),
    })),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalPosts,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: (currentPage - 1) * 9 + index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
