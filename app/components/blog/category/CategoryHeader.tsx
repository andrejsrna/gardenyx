import type { WordPressCategory } from "@/app/lib/content";

export default function CategoryHeader({ category }: { category: WordPressCategory }) {
    return (
        <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Kategória: {category.name}
            </h1>
            {category.description && (
                <p
                    className="text-lg text-gray-600 max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: category.description }}
                />
            )}
        </header>
    );
} 