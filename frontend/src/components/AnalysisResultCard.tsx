import Image from 'next/image';

type AnalysisResult = {
    id: number;
    success: boolean;
    message: string;
    estimated_data?: {
        class: number;
        class_name?: string;
        confidence: number;
    };
};

type AnalysisResultCardProps = {
    isAnalyzing: boolean;
    result: AnalysisResult | null;
    error: string;
    analyzedImageUrl?: string;
    className?: string;
};

export function AnalysisResultCard({ isAnalyzing, result, error, analyzedImageUrl, className = '' }: AnalysisResultCardProps) {
    const LoadingState = () => (
        <div className="text-center py-6">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">解析中...</p>
        </div>
    );

    const SuccessState = ({ result }: { result: AnalysisResult }) => (
        <div className="space-y-3 sm:space-y-4">
            {/* 解析した画像を表示 */}
            {analyzedImageUrl && (
                <div className="mb-3 sm:mb-4">
                    <div className="relative w-full h-24 sm:h-32 md:h-40 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                            src={analyzedImageUrl}
                            alt="解析済み画像"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center text-green-600 mb-2 sm:mb-3">
                <span className="text-lg mr-2">✅</span>
                <span className="text-sm font-medium">解析成功</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">検出オブジェクト:</span>
                    <span className="font-medium text-blue-600 text-sm sm:text-base">
                        {result.estimated_data?.class_name || `クラス ${result.estimated_data?.class}`}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">信頼度:</span>
                    <span className="font-medium text-green-600 text-sm sm:text-base">
                        {Math.round((result.estimated_data?.confidence || 0) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-1.5 sm:mt-2">
                    <div
                        className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((result.estimated_data?.confidence || 0) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );

    const ErrorState = ({ message }: { message: string }) => (
        <div className="text-center py-4">
            <div className="flex items-center justify-center text-red-600 mb-2">
                <span className="text-lg mr-2">❌</span>
                <span className="text-sm font-medium">解析失敗</span>
            </div>
            <p className="text-xs sm:text-sm text-red-600">{message}</p>
        </div>
    );

    const FailureState = ({ result }: { result: AnalysisResult }) => (
        <div className="text-center py-4">
            <div className="flex items-center justify-center text-red-600 mb-2">
                <span className="text-lg mr-2">❌</span>
                <span className="text-sm font-medium">解析失敗</span>
            </div>
            <p className="text-xs sm:text-sm text-red-600">{result.message}</p>
        </div>
    );

    const IdleState = () => (
        <div className="text-center py-6">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-xs sm:text-sm text-gray-500">画像を選択して解析を開始してください</p>
        </div>
    );

    const renderContent = () => {
        if (isAnalyzing) return <LoadingState />;
        if (result?.success) return <SuccessState result={result} />;
        if (result && !result.success) return <FailureState result={result} />;
        if (error) return <ErrorState message={error} />;
        return <IdleState />;
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 ${className}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">解析結果</h3>
            {renderContent()}
        </div>
    );
}
