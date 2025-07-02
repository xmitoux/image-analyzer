type ConfidenceBarProps = {
    confidence: string;
    className?: string;
};

export function ConfidenceBar({ confidence, className = '' }: ConfidenceBarProps) {
    const confidencePercentage = Math.round(parseFloat(confidence) * 100);

    return (
        <div className={`mb-3 ${className}`}>
            <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">信頼度</span>
                <span className="font-bold text-gray-900">{confidencePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${confidencePercentage}%` }}
                />
            </div>
        </div>
    );
}
