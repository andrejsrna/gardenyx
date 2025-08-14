import { Metadata } from 'next';
import { parseHTML } from '../lib/html-parser';
import { getPaginatedPosts, getRankMathSEO, getAllTags, getTagBySlug, getCategories } from '../lib/wordpress';
import BlogSchema from '../components/seo/BlogSchema';
import BreadcrumbSchema from '../components/seo/BreadcrumbSchema';
import BlogHeader from '../components/blog/BlogHeader';
import FilterPanel from '../components/blog/FilterPanel';
import PostList from '../components/blog/PostList';
import Pagination from '../components/blog/Pagination';

const DEFAULT_TITLE = 'Blog o kĺbovej výžive | Najsilnejšia kĺbová výživa';
const DEFAULT_DESCRIPTION = 'Prečítajte si najnovšie články o kĺbovej výžive, zdraví kĺbov a pohybového aparátu. Odborné informácie a praktické rady.';
const SITE_NAME = 'Najsilnejšia kĺbová výživa';

type tSearchParams = Promise<{
    page?: string;
    search?: string;
    tag?: string;
}>;

interface PageProps {
    searchParams: tSearchParams;
}

const generateDefaultImage = (siteUrl: string) => ({
    url: `${siteUrl}/logo.png`,
    width: 1200,
    height: 630,
});

const createBaseMetadata = (siteUrl: string, title: string, description: string) => ({
    title,
    description,
    openGraph: {
        title,
        description,
        url: `${siteUrl}/blog`,
        siteName: SITE_NAME,
        images: [generateDefaultImage(siteUrl)],
        locale: 'sk_SK',
        type: 'website' as const,
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${siteUrl}/logo.png`],
    },
    alternates: {
        canonical: `${siteUrl}/blog`,
    },
    robots: {
        index: true,
        follow: true,
    },
});

const createMetadataFromSEO = (parser: ReturnType<typeof parseHTML>, siteUrl: string): Metadata => {
    const title = parser.getTitle() || DEFAULT_TITLE;
    const description = parser.getMetaTag('description') || DEFAULT_DESCRIPTION;
    const ogImage = parser.getMetaTag('og:image');
    const twitterImage = parser.getMetaTag('twitter:image');
    const robots = parser.getRobots();
    
    const baseMetadata = createBaseMetadata(siteUrl, title, description);
    
    return {
        ...baseMetadata,
        openGraph: {
            ...baseMetadata.openGraph,
            title: parser.getMetaTag('og:title') || title,
            description: parser.getMetaTag('og:description') || description,
            url: parser.getMetaTag('og:url') || `${siteUrl}/blog`,
            siteName: parser.getMetaTag('og:site_name') || SITE_NAME,
            images: ogImage
                ? [{
                    url: ogImage,
                    width: parseInt(parser.getMetaTag('og:image:width') || '1200'),
                    height: parseInt(parser.getMetaTag('og:image:height') || '630'),
                }]
                : baseMetadata.openGraph.images,
        },
        twitter: {
            ...baseMetadata.twitter,
            title: parser.getMetaTag('twitter:title') || title,
            description: parser.getMetaTag('twitter:description') || description,
            images: twitterImage ? [{ url: twitterImage }] : baseMetadata.twitter.images,
        },
        alternates: {
            canonical: parser.getCanonical() || `${siteUrl}/blog`,
        },
        robots: {
            index: !robots?.includes('noindex'),
            follow: !robots?.includes('nofollow'),
        },
    };
};

const createDefaultMetadata = (siteUrl: string): Metadata => 
    createBaseMetadata(siteUrl, DEFAULT_TITLE, DEFAULT_DESCRIPTION);

export async function generateMetadata({ searchParams }: { searchParams: tSearchParams }): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const { page, search, tag } = await searchParams;

    if (!siteUrl) return createDefaultMetadata('');

    let base: Metadata;
    try {
        const seoData = await getRankMathSEO(`${process.env.WORDPRESS_URL}/blog`);
        if (seoData) {
            const parser = parseHTML(seoData.head);
            base = createMetadataFromSEO(parser, siteUrl);
        } else {
            base = createDefaultMetadata(siteUrl);
        }
    } catch (error) {
        console.error('Error fetching SEO data:', error);
        base = createDefaultMetadata(siteUrl);
    }

    const pageParam = page && parseInt(page, 10) > 1 ? `page=${page}` : '';
    const tagParam = tag ? `tag=${tag}` : '';
    const query = [tagParam, pageParam].filter(Boolean).join('&');
    const canonical = query ? `${siteUrl}/blog?${query}` : `${siteUrl}/blog`;
    const robots = search ? { index: false, follow: true } : { index: true, follow: true };

    return {
        ...base,
        alternates: { canonical },
        robots,
    };
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

const getBlogTitle = (tagName?: string, searchQuery?: string) => {
    if (tagName) return `Blog - ${tagName}`;
    if (searchQuery) return 'Blog - Výsledky vyhľadávania';
    return 'Blog o kĺbovej výžive';
};

export default async function BlogPage({ searchParams }: PageProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    const { page, search, tag } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const searchQuery = search || '';
    const tagSlug = tag || '';
    
    const tagInfo = tagSlug ? await getTagBySlug(tagSlug) : null;
    const tagId = tagInfo?.id;
    
    const [
        { posts, totalPages, totalPosts },
        allTags,
        categories
    ] = await Promise.all([
        getPaginatedPosts({ page: currentPage, search: searchQuery, tags: tagId }),
        getAllTags(),
        getCategories(),
    ]);

    const pageDescription = getDescriptionText(tagInfo?.name, searchQuery, totalPosts);
    const blogTitle = getBlogTitle(tagInfo?.name, searchQuery);

    return (
        <main>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <BlogHeader />
                    <FilterPanel 
                        categories={categories} 
                        tags={allTags} 
                        activeTagSlug={tagSlug} 
                        searchQuery={searchQuery} 
                    />

                    {posts.length > 0 ? (
                        <PostList posts={posts} />
                    ) : (
                        <p className="text-center text-gray-600 py-12">
                            Nenašli sa žiadne články zodpovedajúce vášmu výberu.
                        </p>
                    )}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        searchQuery={searchQuery}
                        tagSlug={tagSlug}
                    />
                </div>
            </div>
            
            <BlogSchema
                posts={posts}
                totalPosts={totalPosts}
                currentPage={currentPage}
                pageTitle={blogTitle}
                pageDescription={pageDescription}
            />
            
            <BreadcrumbSchema
                items={[
                    { name: 'Domov', url: siteUrl },
                    { name: 'Blog', url: `${siteUrl}/blog` },
                ]}
            />
        </main>
    );
}
