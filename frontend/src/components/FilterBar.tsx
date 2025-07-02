import { ClassificationTag } from './ClassificationTag';

type FilterBarProps = {
    currentClassification?: string;
    currentClassificationName?: string;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onClearFilter: () => void;
    isLoading?: boolean;
    className?: string;
};

export function FilterBar({
    currentClassification,
    currentClassificationName,
    totalCount,
    currentPage,
    pageSize,
    totalItems,
    onClearFilter,
    isLoading = false,
    className = ''
}: FilterBarProps) {
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 ${isLoading ? 'opacity-75' : ''} ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                    {currentClassification ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-medium">フィルター中:</span>
                            <div className="flex items-center gap-2">
                                <ClassificationTag
                                    classificationId={Number(currentClassification)}
                                    classificationName={currentClassificationName || ''}
                                    variant="filter"
                                />
                                <button
                                    onClick={onClearFilter}
                                    disabled={isLoading}
                                    className={`text-blue-600 hover:text-blue-800 text-xs underline whitespace-nowrap ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    クリア
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs sm:text-sm">分類タグをクリックして絞り込みができます</span>
                    )}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span>総件数: {totalCount}件</span>
                        <span className="hidden sm:inline">|</span>
                        <span className="text-xs">
                            {startItem} - {endItem}件目を表示
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
