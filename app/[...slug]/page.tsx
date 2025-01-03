import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getRankMathSEO } from '../lib/wordpress';
import { parseHTML } from '../lib/html-parser';
import Toast from '../components/Toast';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

interface PostEmbedded {
  'wp:featuredmedia'?: { source_url: string; }[];
  'author'?: { name: string; }[];
}

interface Post {
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  _embedded?: PostEmbedded;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');
  
  // Get RankMath SEO data
  const seoData = await getRankMathSEO(`https://najsilnejsiaklbovavyziva.sk/${slugPath}`);
  
  if (!seoData) {
    const post = await getPostBySlug(slugPath);
    // Fallback to basic metadata if RankMath data is not available
    return {
      title: post?.title.rendered || 'Blog Post',
      description: post?.excerpt.rendered?.replace(/(<([^>]+)>)/gi, '') || '',
      openGraph: {
        images: post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ? [post._embedded['wp:featuredmedia'][0].source_url] : [],
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
      images: parser.getMetaTag('og:image') ? [{url: parser.getMetaTag('og:image') || ''}] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: parser.getMetaTag('twitter:title'),
      description: parser.getMetaTag('twitter:description'),
      images: parser.getMetaTag('twitter:image') ? [{url: parser.getMetaTag('twitter:image') || ''}] : [],
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const post = await getPostBySlug(slugPath) as Post;

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get estimated read time (assuming average reading speed of 200 words per minute)
  const wordCount = post.content.rendered.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <>
      {/* Hero Section with Featured Image */}
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px]">
        {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
          <Image
            src={post._embedded['wp:featuredmedia'][0].source_url}
            alt={post.title.rendered}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Meta */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-gray-600 text-sm">
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

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 
                     prose-p:text-gray-700 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-lg prose-img:shadow-lg prose-strong:text-gray-900
                     prose-blockquote:border-green-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6
                     prose-ul:list-disc prose-ol:list-decimal
                     [&_figure]:!mx-auto [&_figure_img]:!mx-auto [&_figure_figcaption]:text-center"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* Share Buttons */}
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
      <Toast />
    </>
  );
} 