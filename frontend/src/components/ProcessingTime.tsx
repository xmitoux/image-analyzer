type ProcessingTimeProps = {
    timeMs: number;
    className?: string;
};

export function ProcessingTime({ timeMs, className = '' }: ProcessingTimeProps) {
    return (
        <div className={`text-xs text-gray-500 ${className}`}>
            ⏱️ 処理時間: {timeMs}ms
        </div>
    );
}
