import * as Sentry from '@sentry/nextjs';
import { decode } from 'html-entities';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BlogProductWidget from '../components/BlogProductWidget';
import CTA from '../components/CTA';
import TableOfContents from '../components/TableOfContents';
import Toast from '../components/Toast';
import { parseHTML } from '../lib/html-parser';
import { getPostBySlug, getRankMathSEO } from '../lib/wordpress';

if (process.env.NODE_ENV === 'development') {
  Sentry.captureException(new Error('Test error from Sentry integration'));
}

type tParams = Promise<{ slug: string[] }>;

interface PostEmbedded {
  'wp:featuredmedia'?: { source_url: string; }[];
  'author'?: { name: string; }[];
}

interface Post {
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  link: string;
  _embedded?: PostEmbedded;
}

function cleanHtmlContent(html: string): string {
  if (!html) return '';

  const withoutTags = html.replace(/(<([^>]+)>)/gi, '');

  return decode(withoutTags);
}

function makeYouTubeEmbedsResponsive(html: string): string {
  if (!html) return '';

  const youtubePattern = /<iframe[^>]*src=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:embed\/|watch\?v=)?([^"'&?\/\s]+)[^>]*><\/iframe>/gi;

  return html.replace(youtubePattern, (match, videoId) => {
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
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  });
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Remove HTML tags from heading text
    .trim()
    .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") // Remove accents
    .replace(/[^\\w\\s-]/g, '') // Remove non-word chars (excluding spaces and dashes)
    .replace(/\\s+/g, '-') // Replace spaces with single dashes
    .replace(/-+/g, '-'); // Replace multiple dashes with single dashes
}

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
  const post = await getPostBySlug(slugPath) as Post;

  if (!post) {
    notFound();
  }

  let content = post.content.rendered;

  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /<h(2)([^>]*)>([\s\S]*?)<\/h2>/gi;

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

  const h2Regex = /<h2[^>]*>[\s\S]*?<\/h2>/g;
  const parts = content.split(h2Regex);
  const h2Matches = content.match(h2Regex) || [];

  let modifiedContent = '';
  let hasInjectedWidget = false;
  for (let i = 0; i < parts.length; i++) {
    modifiedContent += parts[i];
    if (i === 3 && !hasInjectedWidget) {
      modifiedContent += `
        <div class="my-12">
          <div id="product-widget-mount-point"></div>
        </div>
      `;
      hasInjectedWidget = true;
    }
    if (i < h2Matches.length) {
      modifiedContent += h2Matches[i];
    }
  }

  if (!hasInjectedWidget && parts.length > 0) {
    modifiedContent += `
      <div class="my-12">
        <div id="product-widget-mount-point"></div>
      </div>
    `;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <>
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px]">
        {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
          <div className="relative w-full h-full">
            <Image
              src={post._embedded['wp:featuredmedia'][0].source_url}
              alt={post.title.rendered}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
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
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {formattedDate}
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readTime} min čítania
          </div>
        </div>

        {headings.length > 1 && (
          <div className="mb-10">
            <TableOfContents headings={headings} />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900
                     prose-p:text-gray-700 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-lg prose-img:shadow-lg prose-strong:text-gray-900
                     prose-blockquote:border-green-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6
                     prose-ul:list-disc prose-ol:list-decimal
                     [&_figure]:!mx-auto [&_figure_img]:!mx-auto [&_figure_figcaption]:text-center
                     [&_img]:!relative [&_img]:!h-auto [&_img]:!w-auto"
          dangerouslySetInnerHTML={{ __html: modifiedContent }}
        />

        <BlogProductWidget productIds={[49, 684, 824]} />

        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zdieľať článok</h3>
          <div className="flex gap-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + '/' + slugPath)}`}
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
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + '/' + slugPath)}&text=${encodeURIComponent(post.title.rendered)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              Twitter
            </a>
          </div>
        </div>
      </article>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <CTA />
      </div>

      <Toast />
    </>
  );
}
