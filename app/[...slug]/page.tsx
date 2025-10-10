import * as Sentry from '@sentry/nextjs';
import { decode } from 'html-entities';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogProductWidget from '../components/BlogProductWidget';
import CTA from '../components/CTA';
import TableOfContents from '../components/TableOfContents';
import Toast from '../components/Toast';

import BreadcrumbSchema from '../components/seo/BreadcrumbSchema';
import EnhancedArticleSchema from '../components/blog-seo/EnhancedArticleSchema';
import SmartBreadcrumbs from '../components/internal-linking/SmartBreadcrumbs';
import BlogDataProvider from '../components/blog-seo/BlogDataProvider';
import BlogAnalytics from '../components/blog-seo/BlogAnalytics';
import { getBlogBreadcrumbs } from '../lib/internal-linking-data';
import { parseHTML } from '../lib/html-parser';
import { getPostBySlug, getRankMathSEO, WordPressPost } from '../lib/wordpress';
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import FeaturedImageWithFallback from '../components/FeaturedImageWithFallback';
import CopyLinkButton from '../components/CopyLinkButton';

if (process.env.NODE_ENV === 'development') {
  Sentry.captureException(new Error('Test error from Sentry integration'));
}

type tParams = Promise<{ slug: string[] }>;

function cleanHtmlContent(html: string): string {
  if (!html) return '';

  const withoutTags = html.replace(/(<([^>]+)>)/gi, '');

  return decode(withoutTags);
}

function makeYouTubeEmbedsResponsive(html: string): string {
  if (!html) return '';

  // Enhanced pattern to match various YouTube embed formats
  const youtubePatterns = [
    // Standard YouTube iframe embeds
    /<iframe[^>]*src=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:embed\/|watch\?v=)?([^"'&?\/\s]+)[^>]*><\/iframe>/gi,
    // YouTube short URLs
    /<iframe[^>]*src=["'](?:https?:\/\/)?(?:www\.)?youtu\.be\/([^"'&?\/\s]+)[^>]*><\/iframe>/gi,
    // Gutenberg YouTube blocks
    /<figure[^>]*class="[^"]*wp-block-embed-youtube[^"]*"[^>]*>[\s\S]*?<iframe[^>]*src=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:embed\/|watch\?v=)?([^"'&?\/\s]+)[^>]*><\/iframe>[\s\S]*?<\/figure>/gi
  ];

  let processedHtml = html;

  youtubePatterns.forEach((pattern) => {
    processedHtml = processedHtml.replace(pattern, (match, videoId) => {
      const widthMatch = match.match(/width=["'](\d+)["']/i);
      const heightMatch = match.match(/height=["'](\d+)["']/i);

      const width = widthMatch ? parseInt(widthMatch[1]) : 560;
      const height = heightMatch ? parseInt(heightMatch[1]) : 315;
      const aspectRatio = (height / width) * 100;

      return `
        <div class="youtube-embed-container relative w-full overflow-hidden" style="padding-bottom: ${aspectRatio}%;">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?rel=0"
            class="absolute top-0 left-0 w-full h-full border-0"
            title="YouTube video"
            allowfullscreen>
          </iframe>
        </div>
      `;
    });
  });

  return processedHtml;
}

function makeInstagramEmbedsResponsive(html: string): string {
  if (!html) return '';

  // Enhanced pattern to match Instagram embed blockquotes and Gutenberg blocks
  const instagramPatterns = [
    // Standard Instagram embed blockquotes
    /<blockquote[^>]*class="instagram-media"[^>]*>[\s\S]*?<\/blockquote>/gi,
    // Gutenberg Instagram blocks
    /<figure[^>]*class="[^"]*wp-block-embed-instagram[^"]*"[^>]*>[\s\S]*?<blockquote[^>]*class="instagram-media"[^>]*>[\s\S]*?<\/blockquote>[\s\S]*?<\/figure>/gi
  ];

  let processedHtml = html;

  instagramPatterns.forEach((pattern) => {
    processedHtml = processedHtml.replace(pattern, (match) => {
      return `
        <div class="instagram-embed-container relative w-full max-w-2xl mx-auto my-8">
          ${match}
        </div>
      `;
    });
  });

  return processedHtml;
}

function makeFacebookEmbedsResponsive(html: string): string {
  if (!html) return '';

  // Enhanced pattern to match Facebook embed iframes and Gutenberg blocks
  const facebookPatterns = [
    // Standard Facebook embed iframes
    /<iframe[^>]*src=["'](?:https?:\/\/)?(?:www\.)?facebook\.com\/plugins\/([^"'&?\/\s]+)[^>]*><\/iframe>/gi,
    // Gutenberg Facebook blocks
    /<figure[^>]*class="[^"]*wp-block-embed-facebook[^"]*"[^>]*>[\s\S]*?<iframe[^>]*src=["'](?:https?:\/\/)?(?:www\.)?facebook\.com\/plugins\/([^"'&?\/\s]+)[^>]*><\/iframe>[\s\S]*?<\/figure>/gi
  ];

  let processedHtml = html;

  facebookPatterns.forEach((pattern) => {
    processedHtml = processedHtml.replace(pattern, (match, pluginType) => {
      const widthMatch = match.match(/width=["'](\d+)["']/i);
      const heightMatch = match.match(/height=["'](\d+)["']/i);

      const width = widthMatch ? parseInt(widthMatch[1]) : 500;
      const height = heightMatch ? parseInt(heightMatch[1]) : 300;
      const aspectRatio = (height / width) * 100;

      return `
        <div class="facebook-embed-container relative w-full overflow-hidden" style="padding-bottom: ${aspectRatio}%;">
          <iframe
            src="${match.match(/src=["']([^"']+)["']/i)?.[1] || ''}"
            class="absolute top-0 left-0 w-full h-full border-0"
            title="Facebook ${pluginType}"
            allow="encrypted-media"
            allowfullscreen>
          </iframe>
        </div>
      `;
    });
  });

  return processedHtml;
}

function makeGutenbergEmbedsResponsive(html: string): string {
  if (!html) return '';

  // Handle generic Gutenberg embed blocks
  const gutenbergEmbedPattern = /<figure[^>]*class="[^"]*wp-block-embed[^"]*"[^>]*>[\s\S]*?<\/figure>/gi;

  return html.replace(gutenbergEmbedPattern, (match) => {
    // Check if it's already processed by other functions
    if (match.includes('youtube-embed-container') || 
        match.includes('instagram-embed-container') || 
        match.includes('facebook-embed-container')) {
      return match;
    }

    // Extract the iframe from the Gutenberg block
    const iframeMatch = match.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/i);
    if (iframeMatch) {
      const iframe = iframeMatch[0];
      const widthMatch = iframe.match(/width=["'](\d+)["']/i);
      const heightMatch = iframe.match(/height=["'](\d+)["']/i);

      const width = widthMatch ? parseInt(widthMatch[1]) : 500;
      const height = heightMatch ? parseInt(heightMatch[1]) : 300;
      const aspectRatio = (height / width) * 100;

      return `
        <div class="gutenberg-embed-container relative w-full overflow-hidden" style="padding-bottom: ${aspectRatio}%;">
          ${iframe.replace(/width=["'][^"']*["']/i, 'class="absolute top-0 left-0 w-full h-full border-0"')}
        </div>
      `;
    }

    return match;
  });
}

function makeWikipediaEmbedsBeautiful(html: string): string {
  if (!html) return '';

  // Pattern to match Wikipedia image embeds
  const wikipediaPattern = /<a[^>]*title="([^"]*)"[^>]*href="https:\/\/commons\.wikimedia\.org\/[^"]*"[^>]*><img[^>]*width="(\d+)"[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*><\/a>/gi;

  let isFirstImage = true;

  return html.replace(wikipediaPattern, (match, title, width, alt, src) => {
    // Clean up the title (remove HTML entities and extra info)
    const cleanTitle = title
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/CC BY-SA \d+\.\d+.*$/, '') // Remove license info
      .replace(/via Wikimedia Commons.*$/, '') // Remove "via Wikimedia Commons"
      .trim();

    // Extract author if present in title
    const authorMatch = cleanTitle.match(/^([^,]+),/);
    const author = authorMatch ? authorMatch[1].trim() : '';
    const description = authorMatch ? cleanTitle.replace(/^[^,]+,/, '').trim() : cleanTitle;

    // Use eager loading for first image to optimize LCP
    const loadingAttr = isFirstImage ? 'eager' : 'lazy';
    isFirstImage = false;

    return `
      <div class="wikipedia-embed-container my-8">
        <figure class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div class="relative">
            <img 
              src="${src}" 
              alt="${alt}" 
              class="w-full h-auto object-cover"
              loading="${loadingAttr}"
            />
            <div class="absolute top-2 right-2">
              <a 
                href="https://commons.wikimedia.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-600 hover:text-gray-800 transition-colors"
                title="Wikimedia Commons"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                CC
              </a>
            </div>
          </div>
          <figcaption class="p-4 bg-gray-50 border-t border-gray-200">
            ${author ? `<div class="text-sm font-medium text-gray-900 mb-1">${author}</div>` : ''}
            <div class="text-sm text-gray-600 mb-2">${description}</div>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Zdroj: Wikimedia Commons</span>
              <a 
                href="https://commons.wikimedia.org/wiki/File:${src.split('/').pop()?.split('?')[0]}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-green-600 hover:text-green-700 underline"
              >
                Zobraziť originál
              </a>
            </div>
          </figcaption>
        </figure>
      </div>
    `;
  });
}

function addImageErrorHandling(html: string): string {
  return html.replace(
    /<figure([^>]*)>([\s\S]*?)<img([^>]+)>([\s\S]*?)<\/figure>/gi,
    (match, figureAttrs, beforeImg, imgAttrs, afterImg) => {
      const hasOnError = /onerror\s*=/i.test(imgAttrs);
      if (hasOnError) return match;
      
      return `<figure${figureAttrs}>${beforeImg}<img${imgAttrs} onerror="this.closest('figure').style.display='none';" />${afterImg}</figure>`;
    }
  ).replace(
    /<img([^>]+)>/gi,
    (match, attributes) => {
      const hasOnError = /onerror\s*=/i.test(attributes);
      if (hasOnError) return match;
      
      return `<img${attributes} onerror="this.style.display='none';" />`;
    }
  );
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Remove HTML tags from heading text
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (excluding spaces and dashes)
    .replace(/\s+/g, '-') // Replace spaces with single dashes
    .replace(/-+/g, '-'); // Replace multiple dashes with single dashes
}

type PostTopic = 'ingredient-science' | 'nutrition-tips' | 'joint-health';

function splitContentForProductCTA(html: string): { before: string; after: string } | null {
  if (!html) return null;

  const headingRegex = /<h2[^>]*>[\s\S]*?<\/h2>/gi;
  let headingMatch: RegExpExecArray | null;
  let headingCount = 0;
  let injectionIndex: number | null = null;

  while ((headingMatch = headingRegex.exec(html)) !== null) {
    headingCount += 1;

    if (headingMatch.index === undefined || headingCount < 5) {
      continue;
    }

    injectionIndex = headingMatch.index;
    break;
  }

  if (!injectionIndex) {
    const paragraphRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
    let match: RegExpExecArray | null;
    let count = 0;

    while ((match = paragraphRegex.exec(html)) !== null) {
      count += 1;
      if (match.index === undefined) {
        continue;
      }

      if (count === 6) {
        injectionIndex = match.index;
        break;
      }
    }
  }

  if (injectionIndex === null || injectionIndex < 0 || injectionIndex >= html.length) {
    return null;
  }

  return {
    before: html.slice(0, injectionIndex),
    after: html.slice(injectionIndex),
  };
}

function detectPostTopic(post: WordPressPost): PostTopic {
  const content = (post.content.rendered + post.title.rendered).toLowerCase();
  
  if (content.includes('glukozamín') || content.includes('chondroitín') || content.includes('msm')) {
    return 'ingredient-science';
  }
  
  if (content.includes('výživa') || content.includes('strava') || content.includes('potraviny')) {
    return 'nutrition-tips';
  }
  
  return 'joint-health';
}

const PRODUCT_RECOMMENDATIONS: Record<PostTopic, { ids: number[]; title: string; description: string }> = {
  'joint-health': {
    ids: [824, 49, 684],
    title: 'Top produkty na podporu kĺbov',
    description: 'Tieto doplnky vybrané našimi odborníkmi zlepší pružnosť a znížia bolesť kĺbov.'
  },
  'ingredient-science': {
    ids: [49, 824, 684],
    title: 'Kombinácia účinných látok',
    description: 'Pozrite sa na produkty, ktoré obsahujú glukozamín, chondroitín a ďalšie vedecky podložené zložky.'
  },
  'nutrition-tips': {
    ids: [684, 49, 824],
    title: 'Výživa, ktorá sa stará o vaše kĺby',
    description: 'Doplňte svoju stravu produktmi, ktoré podporujú regeneráciu a výživu kĺbov zvnútra.'
  }
};

const DEFAULT_PRODUCT_RECOMMENDATION = {
  ids: [49, 684, 824],
  title: 'Odporúčané produkty pre vás',
  description: 'Vybrali sme pre vás produkty, ktoré vám pomôžu s vašimi problémami'
};

export async function generateMetadata({ params }: { params: tParams }): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');

  try {
    const post = await getPostBySlug(slugPath);
    if (!post) {
      return {
        title: 'Stránka nenájdená',
        description: 'Požadovaná stránka nebola nájdená.',
      };
    }

    const postDate = new Date(post.date);
    const year = postDate.getFullYear();
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const day = String(postDate.getDate()).padStart(2, '0');

    const postSlug = slug[slug.length - 1];
    const wpPermalink = `${year}/${month}/${day}/${postSlug}`;

    try {
      const seoData = await getRankMathSEO(`${process.env.WORDPRESS_URL}/${wpPermalink}`);

      if (seoData) {
        const parser = parseHTML(seoData.head);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

        const cleanedTitle = cleanHtmlContent(parser.getTitle() || post.title.rendered);
        const cleanedExcerpt = cleanHtmlContent(post.excerpt.rendered);

        const description = cleanHtmlContent(parser.getMetaTag('description') || '') || cleanedExcerpt;

        const ogTitle = cleanHtmlContent(parser.getMetaTag('og:title') || '') || cleanedTitle;
        const ogDescription = cleanHtmlContent(parser.getMetaTag('og:description') || '') || description;

        const twitterTitle = cleanHtmlContent(parser.getMetaTag('twitter:title') || '') || cleanedTitle;
        const twitterDescription = cleanHtmlContent(parser.getMetaTag('twitter:description') || '') || description;

        return {
          title: cleanedTitle,
          description: description,
          openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: `${siteUrl}/${slugPath}`,
            siteName: 'Najsilnejšia kĺbová výživa',
            images: parser.getMetaTag('og:image')
              ? [{ url: parser.getMetaTag('og:image')! }]
              : post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                ? [{ url: post._embedded['wp:featuredmedia'][0].source_url }]
                : [],
            locale: 'sk_SK',
            type: 'article',
          },
          twitter: {
            card: 'summary_large_image',
            title: twitterTitle,
            description: twitterDescription,
            images: parser.getMetaTag('twitter:image')
              ? [{ url: parser.getMetaTag('twitter:image')! }]
              : post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                ? [{ url: post._embedded['wp:featuredmedia'][0].source_url }]
                : [],
          },
          alternates: {
            canonical: `${siteUrl}/${slugPath}`,
          },
          robots: {
            index: true,
            follow: true,
          },
        };
      } else {
        const cleanedTitle = cleanHtmlContent(post.title.rendered);
        const cleanedExcerpt = cleanHtmlContent(post.excerpt.rendered);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

        return {
          title: cleanedTitle,
          description: cleanedExcerpt,
          openGraph: {
            title: cleanedTitle,
            description: cleanedExcerpt,
            url: `${siteUrl}/${slugPath}`,
            siteName: 'Najsilnejšia kĺbová výživa',
            images: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
              ? [{ url: post._embedded['wp:featuredmedia'][0].source_url }]
              : [],
            locale: 'sk_SK',
            type: 'article',
          },
          twitter: {
            card: 'summary_large_image',
            title: cleanedTitle,
            description: cleanedExcerpt,
            images: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
              ? [{ url: post._embedded['wp:featuredmedia'][0].source_url }]
              : [],
          },
          alternates: {
            canonical: `${siteUrl}/${slugPath}`,
          },
          robots: {
            index: true,
            follow: true,
          },
        };
      }
    } catch (seoError) {
      console.error('Error fetching SEO data:', seoError);
      const cleanedTitle = cleanHtmlContent(post.title.rendered);
      const cleanedExcerpt = cleanHtmlContent(post.excerpt.rendered);
      return {
        title: cleanedTitle,
        description: cleanedExcerpt,
        openGraph: {
          title: cleanedTitle,
          description: cleanedExcerpt,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slugPath}`,
          siteName: 'Najsilnejšia kĺbová výživa',
          images: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
            ? [{ url: post._embedded['wp:featuredmedia'][0].source_url }]
            : [],
          locale: 'sk_SK',
          type: 'article',
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Stránka nenájdená',
      description: 'Požadovaná stránka nebola nájdená.',
    };
  }

  return {
    title: 'Najsilnejšia kĺbová výživa',
    description: 'Najsilnejšia kĺbová výživa na Slovensku',
  };
}

export default async function BlogPost({ params }: { params: tParams }) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const post = await getPostBySlug(slugPath);

  if (!post) {
    notFound();
  }

  let content = post.content.rendered;
  const plainTextContent = cleanHtmlContent(post.content.rendered);

  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi;

  const replacements: { original: string; replacement: string }[] = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const [fullMatch, levelStr, attrs, innerHTML] = match;
    const level = parseInt(levelStr, 10);

    const textContent = decode(innerHTML.replace(/<[^>]*>/g, '').trim());
    if (!textContent) continue;

    const id = createSlug(textContent);

    const cleanAttrs = attrs.replace(/\s+id=(?:\"[^\"]*\"|'[^']*'|[^\\s>]+)/i, '');

    headings.push({ id, text: textContent, level });

    const replacementString = `<h${level}${cleanAttrs} id=\"${id}\">${innerHTML}</h${level}>`;
    replacements.push({ original: fullMatch, replacement: replacementString });
  }

  replacements.forEach(({ original, replacement }) => {
    content = content.replace(original, replacement);
  });

  content = makeYouTubeEmbedsResponsive(content);
  content = makeInstagramEmbedsResponsive(content);
  content = makeFacebookEmbedsResponsive(content);
  content = makeGutenbergEmbedsResponsive(content);
  content = makeWikipediaEmbedsBeautiful(content);
  content = addImageErrorHandling(content);

  const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const wordCount = plainTextContent
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const postTopic = detectPostTopic(post);
  const productRecommendation = PRODUCT_RECOMMENDATIONS[postTopic] || DEFAULT_PRODUCT_RECOMMENDATION;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://najsilnejsiaklbovavyziva.sk';
  const articleUrl = `${siteUrl}/${slugPath}`;
  const plainTitle = decode(post.title.rendered.replace(/<[^>]*>/g, ''));
  const contentSplit = splitContentForProductCTA(content);
  const articleBodyClasses = `prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-28
                     prose-p:text-gray-700 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-lg prose-img:shadow-lg prose-strong:text-gray-900
                     prose-blockquote:border-green-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6
                     prose-ul:list-disc prose-ol:list-decimal
                     [&_figure]:!mx-auto [&_figure_img]:!mx-auto [&_figure_figcaption]:text-center
                     [&_img]:!relative [&_img]:!h-auto [&_img]:!w-auto`;

  const breadcrumbItems = [
    { name: 'Domov', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: plainTitle, url: articleUrl }
  ];

  const smartBreadcrumbs = getBlogBreadcrumbs(
    plainTitle,
    slugPath
  );

  const categories = post._embedded?.['wp:term']?.[0] || [];
  const tags = post._embedded?.['wp:term']?.[1] || [];
  const categoryNames = categories.map((category) => category.name).filter(Boolean);
  const tagNames = tags.map((tag) => tag.name).filter(Boolean);

  return (
    <>
      <EnhancedArticleSchema 
        post={post} 
        readTime={readTime}
        wordCount={wordCount}
        categories={categoryNames}
        tags={tagNames}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Smart Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <SmartBreadcrumbs 
          items={smartBreadcrumbs} 
          showDescriptions={false}
          className="text-sm"
        />
      </div>
      <div className="relative w-full h-[45vh] min-h-[320px] md:h-[60vh] md:min-h-[400px] max-h-[600px]">
        {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
          <div className="relative w-full h-full">
            <FeaturedImageWithFallback
              src={post._embedded['wp:featuredmedia'][0].source_url}
              alt={post.title.rendered}
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800" />
        )}
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-200">
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={post.date}>{formattedDate}</time>
              </div>
              <span className="hidden md:block">•</span>
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{readTime} min čítania</span>
              </div>
            </div>
            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Link key={category.id} href={`/blog/kategoria/${category.slug}`} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-8 sm:my-0 sm:mt-12 mt-12 md:py-12">
        {headings.length > 1 && (
          <div className="mb-10">
            <TableOfContents headings={headings} />
          </div>
        )}

        {contentSplit ? (
          <>
            <div
              className={articleBodyClasses}
              dangerouslySetInnerHTML={{ __html: contentSplit.before }}
            />
            <div className="my-12">
              <BlogProductWidget 
                productIds={productRecommendation.ids}
                title={productRecommendation.title}
                description={productRecommendation.description}
              />
            </div>
            {contentSplit.after.trim() && (
              <div
                className={articleBodyClasses}
                dangerouslySetInnerHTML={{ __html: contentSplit.after }}
              />
            )}
          </>
        ) : (
          <>
            <div
              className={articleBodyClasses}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <div className="my-12">
              <BlogProductWidget 
                productIds={productRecommendation.ids}
                title={productRecommendation.title}
                description={productRecommendation.description}
              />
            </div>
          </>
        )}

        <div className="mt-12 rounded-2xl border border-green-100 bg-green-50/70 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white text-2xl font-semibold">
            AS
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Autor článku</p>
            <h3 className="text-2xl font-bold text-gray-900">Andrej Srna</h3>
            <p className="text-gray-700">
              Som nadšenec pre zdravie kĺbov a každý týždeň posielam praktické tipy a prístup k exkluzívnym zľavám.
              Pridajte sa k môjmu newsletteru a nezmeškáte nové články ani tajné akcie.
            </p>
          </div>
          <Link
            href="/#newsletter"
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors"
          >
            Chcem tipy e-mailom
          </Link>
        </div>

        {/* Related Posts Section will be shown after the article */}

        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zdieľať článok</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              Facebook
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${plainTitle} ${articleUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaWhatsapp className="w-5 h-5" />
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(plainTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <FaTelegramPlane className="w-5 h-5" />
              Telegram
            </a>
            <CopyLinkButton url={articleUrl} className="bg-gray-100 text-gray-700 hover:bg-gray-200" />
          </div>
        </div>
      </article>

      {/* Related Blog Posts - Real Data */}
      <div className="max-w-4xl mx-auto px-4">
        <BlogDataProvider 
          currentPostId={post.id}
          postTitle={plainTitle}
          postContent={plainTextContent}
          postExcerpt={cleanHtmlContent(post.excerpt.rendered)}
          maxPosts={9}
          layout="list"
        />
      </div>

      {/* Blog Analytics Tracking */}
      <BlogAnalytics
        postId={post.id}
        postTitle={plainTitle}
        postSlug={slugPath}
        readTime={readTime}
        wordCount={wordCount}
        topic={postTopic}
      />

      <div className="max-w-4xl mx-auto px-4 mt-12 md:mt-0">
        <CTA />
      </div>

      <Toast />
    </>
  );
}
