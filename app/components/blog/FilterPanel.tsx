import Link from 'next/link';
import TagFilter from '@/app/components/blog/TagFilter';
import type { WordPressCategory, WordPressTag } from '@/app/lib/content';

const SearchForm = ({ searchQuery }: { searchQuery?: string }) => (
    <form action="/blog" method="get" className="flex gap-2">
        <input
            type="search"
            name="search"
            placeholder="Zadajte hľadaný výraz..."
            defaultValue={searchQuery}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
        />
        <button
            type="submit"
            className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
            Hľadať
        </button>
    </form>
);

const CategoryFilter = ({ categories }: { categories: WordPressCategory[] }) => {
    if (!categories || categories.length === 0) return null;
    return (
        <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Kategórie</h3>
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <Link
                        key={category.id}
                        href={`/blog/kategoria/${category.slug}`}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium border border-transparent hover:bg-green-100 hover:text-green-800 transition-colors"
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default function FilterPanel({ categories, tags, activeTagSlug, searchQuery }: {
    categories: WordPressCategory[];
    tags: WordPressTag[];
    activeTagSlug?: string;
    searchQuery?: string;
}) {
    return (
        <section className="bg-white rounded-xl p-6 md:p-8 mb-12 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Vyhľadávanie</h3>
                    <p className="text-sm text-gray-500 mb-4">Hľadajte kľúčové slová v našich článkoch.</p>
                    <SearchForm searchQuery={searchQuery} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <CategoryFilter categories={categories} />
                    </div>
                    <div>
                        <TagFilter allTags={tags} selectedTagSlug={activeTagSlug} searchQuery={searchQuery} />
                    </div>
                </div>
            </div>
        </section>
    );
} 