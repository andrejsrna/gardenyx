import Link from 'next/link';

export default function CategoryPagination({
    currentPage,
    totalPages,
    categorySlug
}: {
    currentPage: number;
    totalPages: number;
    categorySlug: string;
}) {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="mt-12 flex justify-center">
            <ul className="flex items-center gap-2">
                {pageNumbers.map((page) => (
                    <li key={page}>
                        <Link
                            href={`/blog/kategoria/${categorySlug}?page=${page}`}
                            className={`px-4 py-2 rounded-md transition-colors ${currentPage === page
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {page}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}; 