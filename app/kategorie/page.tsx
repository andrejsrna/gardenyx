import { getCategories, WordPressCategory } from '@/app/lib/content';
import Link from 'next/link';
import { Metadata } from 'next';
import { buildStaticMetadata } from '@/app/lib/seo';

export const metadata: Metadata = buildStaticMetadata({
    title: 'Kategórie blogu | Najsilnejšia kĺbová výživa',
    description: 'Prehľad všetkých kategórií článkov na blogu o zdraví kĺbov, výžive a pohybovom aparáte.',
    path: '/kategorie',
});

async function fetchCategories(): Promise<WordPressCategory[]> {
    try {
        return await getCategories();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export default async function KategoriePage() {
    const categories = await fetchCategories();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Kategórie</h1>
            {categories.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <li key={category.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <Link href={`/blog/kategoria/${category.slug}`} className="block p-6">
                                <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
                                <p className="text-gray-600 mt-2">Počet článkov: {category.count}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">Nenašli sa žiadne kategórie.</p>
            )}
        </div>
    );
} 
