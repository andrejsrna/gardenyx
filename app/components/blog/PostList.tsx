import Link from 'next/link';
import type { WordPressPost } from '@/app/lib/wordpress';
import FeaturedImageWithFallback from '../FeaturedImageWithFallback';

const PostCard = ({ post, index }: { post: WordPressPost; index: number }) => {
    const slug = post.slug || post.link.split('/').filter(Boolean).pop() || '';
    const href = slug.startsWith('/') ? slug : `/${slug}`;
    const formattedDate = new Date(post.date).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const isPriority = index < 3; // First 3 images should have priority

    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden group">
            <Link href={href}>
                <div className="relative h-48 overflow-hidden">
                    <FeaturedImageWithFallback
                        src={featuredImage}
                        alt={post.title.rendered}
                        sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={isPriority}
                    />
                </div>
            </Link>
            <div className="p-6 flex flex-col">
                <time className="text-sm text-gray-500 mb-2 block">
                    {formattedDate}
                </time>
                <h2 className="text-xl font-semibold mb-2 flex-grow">
                    <Link href={href} className="hover:text-green-600 transition-colors">
                        <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    </Link>
                </h2>
                <div
                    className="text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
                <Link
                    href={href}
                    className="text-green-600 font-medium hover:underline inline-flex items-center self-start"
                >
                    Čítať viac <span className="ml-1">→</span>
                </Link>
            </div>
        </article>
    );
};


export default function PostList({ posts }: { posts: WordPressPost[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
            ))}
        </div>
    );
} 
