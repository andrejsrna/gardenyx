import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPaginatedPosts } from '../../../lib/wordpress';
import CategoryHeader from '@/app/components/blog/category/CategoryHeader';
import PostList from '@/app/components/blog/PostList';
import CategoryPagination from '@/app/components/blog/category/CategoryPagination';

type tParams = Promise<{ slug: string }>;
type tSearchParams = Promise<{ page?: string }>;

interface CategoryPageProps {
  params: tParams;
  searchParams: tSearchParams;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Kategória nenájdená',
      description: 'Požadovaná kategória neexistuje.',
    };
  }

  const title = `${category.name} | Blog`;
  const description = category.description || `Prečítajte si všetky články v kategórii ${category.name}.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const categoryUrl = `${siteUrl}/blog/kategoria/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: categoryUrl,
      type: 'website',
      siteName: 'Najsilnejšia kĺbová výživa',
      locale: 'sk_SK',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: categoryUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { posts, totalPages } = await getPaginatedPosts({
    page: currentPage,
    category: category.id,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <CategoryHeader category={category} />

      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <p className="text-center text-gray-500">
          V tejto kategórii sa zatiaľ nenachádzajú žiadne články.
        </p>
      )}

      <CategoryPagination currentPage={currentPage} totalPages={totalPages} categorySlug={slug} />
    </div>
  );
} 