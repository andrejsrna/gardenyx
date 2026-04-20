import { WordPressPost } from '@/app/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';

interface ArticleSchemaProps {
  post: WordPressPost;
}

export default function ArticleSchema({ post }: ArticleSchemaProps) {
  const cleanText = (html: string) => html.replace(/(<([^>]+)>)/gi, '');
  const authorName = post._embedded?.['author']?.[0]?.name || 'GardenYX';
  const updatedDate = post.meta?.updated || post.date;
  const canonicalUrl = post.meta?.canonicalUrl
    ? post.meta.canonicalUrl.startsWith('http')
      ? post.meta.canonicalUrl
      : `${SITE_URL}${post.meta.canonicalUrl.startsWith('/') ? post.meta.canonicalUrl : `/${post.meta.canonicalUrl}`}`
    : `${SITE_URL}/${post.slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cleanText(post.title.rendered),
    description: cleanText(post.excerpt.rendered),
    author: {
      '@type': 'Person',
      name: cleanText(authorName),
    },
    publisher: {
      '@type': 'Organization',
      name: 'GardenYX',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.date,
    dateModified: updatedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    ...(post._embedded?.['wp:featuredmedia']?.[0]?.source_url && {
      image: {
        '@type': 'ImageObject',
        url: post._embedded['wp:featuredmedia'][0].source_url,
        width: 1200,
        height: 630,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
