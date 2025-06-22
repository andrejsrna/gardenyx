import Link from 'next/link';

const buildPageUrl = (page: number, search?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    
    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ''}`;
};

export default function Pagination({ currentPage, totalPages, searchQuery, tagSlug }: {
    currentPage: number;
    totalPages: number;
    searchQuery?: string;
    tagSlug?: string;
}) {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
        const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    
    const pageLinkClasses = (isActive = false) =>
        `px-4 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-white text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <nav className="flex justify-center items-center space-x-2 mt-12">
            {currentPage > 1 && (
                <Link
                    href={buildPageUrl(currentPage - 1, searchQuery, tagSlug)}
                    className={pageLinkClasses()}
                >
                    &laquo; Predchádzajúca
                </Link>
            )}

            {startPage > 1 && (
                <>
                    <Link href={buildPageUrl(1, searchQuery, tagSlug)} className={pageLinkClasses()}>1</Link>
                    {startPage > 2 && <span className="px-4 py-2">...</span>}
                </>
            )}

            {pageNumbers.map(page => (
                <Link
                    key={page}
                    href={buildPageUrl(page, searchQuery, tagSlug)}
                    className={pageLinkClasses(currentPage === page)}
                >
                    {page}
                </Link>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="px-4 py-2">...</span>}
                    <Link href={buildPageUrl(totalPages, searchQuery, tagSlug)} className={pageLinkClasses()}>{totalPages}</Link>
                </>
            )}
            
            {currentPage < totalPages && (
                <Link
                    href={buildPageUrl(currentPage + 1, searchQuery, tagSlug)}
                    className={pageLinkClasses()}
                >
                    Ďalšia &raquo;
                </Link>
            )}
        </nav>
    );
} 