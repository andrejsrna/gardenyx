import { WordPressPost } from '@/app/lib/wordpress';

interface ArticleSchemaProps {
  post: WordPressPost;
}

export default function ArticleSchema({ post }: ArticleSchemaProps) {
  const cleanText = (html: string) => html.replace(/(<([^>]+)>)/gi, '');
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": cleanText(post.title.rendered),
    "description": cleanText(post.excerpt.rendered),
    "author": {
      "@type": "Person",
      "name": "Andrej Srna"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Najsilnejšia kĺbová výživa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://najsilnejsiaklbovavyziva.sk/images/logo.png"
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://najsilnejsiaklbovavyziva.sk/blog/${post.slug}`
    },
    ...(post._embedded?.['wp:featuredmedia']?.[0]?.source_url && {
      "image": {
        "@type": "ImageObject",
        "url": post._embedded['wp:featuredmedia'][0].source_url,
        "width": 1200,
        "height": 630
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 