import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPaginatedPosts } from '../../../lib/wordpress';
import CategoryHeader from '@/app/components/blog/category/CategoryHeader';
import PostList from '@/app/components/blog/PostList';
import CategoryPagination from '@/app/components/blog/category/CategoryPagination';
import BreadcrumbSchema from '@/app/components/seo/BreadcrumbSchema';

type tParams = Promise<{ slug: string }>;
type tSearchParams = Promise<{ page?: string }>;

interface CategoryPageProps {
  params: tParams;
  searchParams: tSearchParams;
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
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
  const canonical = page && parseInt(page, 10) > 1 ? `${categoryUrl}?page=${page}` : categoryUrl;

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
      canonical,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const breadcrumbItems = [
    { name: 'Domov', url: siteUrl || '/' },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: category.name, url: `${siteUrl}/blog/kategoria/${slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <BreadcrumbSchema items={breadcrumbItems} />
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