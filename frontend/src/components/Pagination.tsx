type PaginationInfo = {
    current_page: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
};

type PaginationProps = {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    className?: string;
};

export function Pagination({ pagination, onPageChange, disabled = false, className = '' }: PaginationProps) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (pagination.total_pages <= maxVisiblePages) {
            for (let i = 1; i <= pagination.total_pages; i++) {
                pages.push(i);
            }
        } else if (pagination.current_page <= 3) {
            for (let i = 1; i <= maxVisiblePages; i++) {
                pages.push(i);
            }
        } else if (pagination.current_page >= pagination.total_pages - 2) {
            for (let i = pagination.total_pages - 4; i <= pagination.total_pages; i++) {
                pages.push(i);
            }
        } else {
            for (let i = pagination.current_page - 2; i <= pagination.current_page + 2; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className={`flex justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
            <div className="flex items-center gap-3">
                <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pagination.has_previous && !disabled
                        ? 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-500'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                    disabled={!pagination.has_previous || disabled}
                    onClick={() => onPageChange(pagination.current_page - 1)}
                >
                    前へ
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pageNum === pagination.current_page && !disabled
                                ? 'bg-blue-500 text-white border border-blue-500'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            disabled={disabled}
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pagination.has_next && !disabled
                        ? 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-500'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                    disabled={!pagination.has_next || disabled}
                    onClick={() => onPageChange(pagination.current_page + 1)}
                >
                    次へ
                </button>
            </div>
        </div>
    );
}
