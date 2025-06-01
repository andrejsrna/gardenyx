import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import FeaturedPost from '../components/FeaturedPost';
import { parseHTML } from '../lib/html-parser';
import type { WordPressPost } from '../lib/wordpress';
import { getPaginatedPosts, getPostBySlug, getRankMathSEO, getAllTags, getTagBySlug } from '../lib/wordpress';
import TagFilter from './TagFilter';

const FEATURED_POST_SLUG = 'ako-si-vybrat-najlepsiu-klbovu-vyzivu-pre-vase-potreby-kompletny-sprievodca';
const DEFAULT_TITLE = 'Blog o kĺbovej výžive | Najsilnejšia kĺbová výživa';
const DEFAULT_DESCRIPTION = 'Prečítajte si najnovšie články o kĺbovej výžive, zdraví kĺbov a pohybového aparátu. Odborné informácie a praktické rady.';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        tag?: string;
    }>;
}

const generateDefaultImage = (siteUrl: string) => ({
    url: `${siteUrl}/og-image.jpg`,
    width: 1200,
    height: 630,
});

const createMetadataFromSEO = (parser: ReturnType<typeof parseHTML>, siteUrl: string): Metadata => {
    const ogImage = parser.getMetaTag('og:image');
    const twitterImage = parser.getMetaTag('twitter:image');
    
    return {
        title: parser.getTitle() || DEFAULT_TITLE,
        description: parser.getMetaTag('description') || DEFAULT_DESCRIPTION,
        openGraph: {
            title: parser.getMetaTag('og:title') || DEFAULT_TITLE,
            description: parser.getMetaTag('og:description') || DEFAULT_DESCRIPTION,
            url: parser.getMetaTag('og:url') || `${siteUrl}/blog`,
            siteName: parser.getMetaTag('og:site_name') || 'Najsilnejšia kĺbová výživa',
            images: ogImage
                ? [{
                    url: ogImage,
                    width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
                    height: parseInt(parser.getMetaTag('og:image:height') || '630'),
                }]
                : [generateDefaultImage(siteUrl)],
            locale: 'sk_SK',
            type: 'website' as const,
        },
        twitter: {
            card: 'summary_large_image',
            title: parser.getMetaTag('twitter:title') || DEFAULT_TITLE,
            description: parser.getMetaTag('twitter:description') || DEFAULT_DESCRIPTION,
            images: twitterImage
                ? [{ url: twitterImage }]
                : [`${siteUrl}/og-image.jpg`],
        },
        alternates: {
            canonical: parser.getCanonical() || `${siteUrl}/blog`,
        },
        robots: {
            index: !parser.getRobots()?.includes('noindex'),
            follow: !parser.getRobots()?.includes('nofollow'),
        },
    };
};

const createDefaultMetadata = (siteUrl: string): Metadata => ({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    openGraph: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        url: `${siteUrl}/blog`,
        siteName: 'Najsilnejšia kĺbová výživa',
        images: [generateDefaultImage(siteUrl)],
        locale: 'sk_SK',
        type: 'website' as const,
    },
    twitter: {
        card: 'summary_large_image',
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
        canonical: `${siteUrl}/blog`,
    },
    robots: {
        index: true,
        follow: true,
    },
});

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!siteUrl) return createDefaultMetadata('');

    try {
        const seoData = await getRankMathSEO(`${process.env.WORDPRESS_URL}/blog`);
        
        if (seoData) {
            const parser = parseHTML(seoData.head);
            return createMetadataFromSEO(parser, siteUrl);
        }
    } catch (error) {
        console.error('Error fetching SEO data:', error);
    }

    return createDefaultMetadata(siteUrl);
}

const getDescriptionText = (tagName?: string, searchQuery?: string, totalPosts?: number) => {
    if (tagName && searchQuery) {
        return `Výsledky vyhľadávania pre "${searchQuery}" v téme "${tagName}" (${totalPosts})`;
    }
    if (tagName) {
        return `Články o téme "${tagName}" (${totalPosts})`;
    }
    if (searchQuery) {
        return `Výsledky vyhľadávania pre "${searchQuery}" (${totalPosts})`;
    }
    return `Všetky články o zdraví kĺbov (${totalPosts})`;
};

const buildPageUrl = (page: number, search?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    
    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ''}`;
};

const PostCard = ({ post }: { post: WordPressPost }) => {
    const slug = post.link.split('/').filter(Boolean).pop();
    const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {featuredImage && (
                <Link href={`/${slug}`}>
                    <div className="relative h-48">
                        <Image
                            src={featuredImage}
                            alt={post.title.rendered}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
};

const FilterChips = ({ tagName, searchQuery, tagSlug }: { 
    tagName?: string; 
    searchQuery?: string; 
    tagSlug?: string; 
}) => {
    if (!tagName && !searchQuery) return null;

    return (
        <div className="mb-6 flex justify-center gap-2 flex-wrap">
            {tagName && (
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <span>Téma: {tagName}</span>
                    <Link
                        href={`/blog${searchQuery ? `?search=${searchQuery}` : ''}`}
                        className="ml-2 text-green-600 hover:text-green-800"
                        title="Odstrániť filter témy"
                    >
                        ×
                    </Link>
                </div>
            )}
            {searchQuery && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <span>Hľadané: {searchQuery}</span>
                    <Link
                        href={`/blog${tagSlug ? `?tag=${tagSlug}` : ''}`}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        title="Odstrániť vyhľadávanie"
                    >
                        ×
                    </Link>
                </div>
            )}
        </div>
    );
};

const SearchForm = ({ searchQuery }: { searchQuery?: string }) => (
    <form action="/blog" method="get" className="max-w-2xl mx-auto flex gap-4">
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
);

const Pagination = ({ currentPage, totalPages, searchQuery, tagSlug }: {
    currentPage: number;
    totalPages: number;
    searchQuery?: string;
    tagSlug?: string;
}) => {
    if (totalPages <= 1) return null;

    return (
        <nav className="flex justify-center gap-2">
            {currentPage > 1 && (
                <Link
                    href={buildPageUrl(currentPage - 1, searchQuery, tagSlug)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Predchádzajúca
                </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum, searchQuery, tagSlug)}
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
                    href={buildPageUrl(currentPage + 1, searchQuery, tagSlug)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Ďalšia →
                </Link>
            )}
        </nav>
    );
};

export default async function BlogPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const searchQuery = params.search || '';
    const tagSlug = params.tag || '';

    const [tagInfo, allTags, postsData, featuredPost] = await Promise.all([
        tagSlug ? getTagBySlug(tagSlug) : Promise.resolve(null),
        getAllTags(),
        getPaginatedPosts({
            page: currentPage,
            search: searchQuery,
            tags: tagSlug ? undefined : undefined,
        }).then(async (data) => {
            if (tagSlug) {
                const tag = await getTagBySlug(tagSlug);
                if (tag) {
                    return getPaginatedPosts({
                        page: currentPage,
                        search: searchQuery,
                        tags: tag.id,
                    });
                }
            }
            return data;
        }),
        getPostBySlug(FEATURED_POST_SLUG).catch(() => null),
    ]);

    const { posts, totalPages, totalPosts } = postsData;

    return (
        <main className="py-16">
            <div className="container mx-auto px-4">
                {featuredPost && (
                    <FeaturedPost
                        title={featuredPost.title.rendered}
                        excerpt={featuredPost.excerpt.rendered}
                        imageUrl={featuredPost._embedded?.['wp:featuredmedia']?.[0]?.source_url}
                        slug={FEATURED_POST_SLUG}
                    />
                )}

                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Blog</h1>
                    <p className="text-gray-600 mb-8">
                        {getDescriptionText(tagInfo?.name, searchQuery, totalPosts)}
                    </p>

                    <FilterChips 
                        tagName={tagInfo?.name} 
                        searchQuery={searchQuery} 
                        tagSlug={tagSlug} 
                    />

                    <SearchForm searchQuery={searchQuery} />
                </header>

                <TagFilter 
                    allTags={allTags}
                    selectedTagSlug={tagSlug}
                    searchQuery={searchQuery}
                />

                {posts.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
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

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchQuery={searchQuery}
                    tagSlug={tagSlug}
                />
            </div>
        </main>
    );
}
