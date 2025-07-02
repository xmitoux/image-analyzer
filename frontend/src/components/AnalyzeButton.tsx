type AnalyzeButtonProps = {
    onClick: () => void;
    disabled: boolean;
    isAnalyzing: boolean;
    className?: string;
};

export function AnalyzeButton({ onClick, disabled, isAnalyzing, className = '' }: AnalyzeButtonProps) {
    return (
        <div className={`mb-4 sm:mb-6 ${className}`}>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-colors ${!disabled
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {isAnalyzing ? (
                    <span className="flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        解析中...
                    </span>
                ) : (
                    '解析開始'
                )}
            </button>
        </div>
    );
}
