import { WordPressPost } from '@/app/lib/content';

interface EnhancedArticleSchemaProps {
  post: WordPressPost;
  readTime: number;
  wordCount: number;
  categories?: string[];
  tags?: string[];
  relatedArticles?: Array<{
    title: string;
    url: string;
  }>;
}

export default function EnhancedArticleSchema({ 
  post, 
  readTime, 
  wordCount, 
  categories = [], 
  tags = [],
  relatedArticles = []
}: EnhancedArticleSchemaProps) {
  const cleanText = (html: string) => html.replace(/(<([^>]+)>)/gi, '');
  const siteUrl = 'https://najsilnejsiaklbovavyziva.sk';
  const authorName = cleanText(post._embedded?.['author']?.[0]?.name || 'Náš tím');
  const publishDate = new Date(post.date).toISOString();
  const modifiedDate = new Date(post.meta?.updated || post.date).toISOString();
  const canonicalUrl = post.meta?.canonicalUrl
    ? post.meta.canonicalUrl.startsWith('http')
      ? post.meta.canonicalUrl
      : `${siteUrl}${post.meta.canonicalUrl.startsWith('/') ? post.meta.canonicalUrl : `/${post.meta.canonicalUrl}`}`
    : `${siteUrl}/${post.slug}`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": cleanText(post.title.rendered),
    "description": cleanText(post.excerpt.rendered),
    "articleBody": cleanText(post.content.rendered).substring(0, 1000) + "...", // First 1000 chars
    "wordCount": wordCount,
    "timeRequired": `PT${readTime}M`,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Najsilnejšia kĺbová výživa",
      "description": "Špecialisti na prírodné doplnky výživy pre zdravé kĺby",
      "url": "https://najsilnejsiaklbovavyziva.sk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://najsilnejsiaklbovavyziva.sk/logo.png",
        "width": 300,
        "height": 100
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+421-914-230-321",
        "contactType": "customer service",
        "areaServed": "SK",
        "availableLanguage": "Slovak"
      },
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61575962272009"
      ]
    },
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Najsilnejšia kĺbová výživa",
      "@id": "https://najsilnejsiaklbovavyziva.sk"
    },
    "inLanguage": "sk-SK",
    "potentialAction": {
      "@type": "ReadAction",
      "target": [canonicalUrl]
    },
    ...(post._embedded?.['wp:featuredmedia']?.[0]?.source_url && {
      "image": {
        "@type": "ImageObject",
        "url": post._embedded['wp:featuredmedia'][0].source_url,
        "width": 1200,
        "height": 630,
        "caption": cleanText(post.title.rendered)
      }
    }),
    ...(categories.length > 0 && {
      "articleSection": categories
    }),
    ...(tags.length > 0 && {
      "keywords": tags.join(", ")
    }),
    ...(relatedArticles.length > 0 && {
      "relatedLink": relatedArticles.map(article => article.url)
    }),
    "about": [
      {
        "@type": "Thing",
        "name": "Zdravie kĺbov",
        "description": "Informácie a rady pre udržanie zdravých kĺbov"
      },
      {
        "@type": "Thing", 
        "name": "Prírodné doplnky výživy",
        "description": "Prírodné ingrediencie pre podporu zdravia"
      }
    ],
    "mentions": [
      {
        "@type": "Thing",
        "name": "Glukozamín",
        "url": "https://najsilnejsiaklbovavyziva.sk/zlozenie/glukozamin"
      },
      {
        "@type": "Thing",
        "name": "Chondroitín", 
        "url": "https://najsilnejsiaklbovavyziva.sk/zlozenie/chondroitin"
      },
      {
        "@type": "Thing",
        "name": "Kolagén",
        "url": "https://najsilnejsiaklbovavyziva.sk/zlozenie/kolagen"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 
