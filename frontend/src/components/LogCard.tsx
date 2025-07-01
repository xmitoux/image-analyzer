import { formatAbsoluteTime, getClassificationColor, getClassificationName } from '@/lib/utils';
import { AnalysisLog } from '@/types/analysis';
import Image from 'next/image';

type LogCardProps = {
    log: AnalysisLog;
    onClassificationClick?: (classification: number) => void;
}

export function LogCard({ log, onClassificationClick }: LogCardProps) {
    const confidencePercentage = Math.round(parseFloat(log.confidence) * 100);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                {/* 画像プレビュー部分 */}
                <div className="flex-shrink-0">
                    <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {log.image_path && log.image_path.startsWith('https://') ? (
                            <Image
                                src={log.image_path}
                                alt="分析画像"
                                width={128}
                                height={96}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                    // 画像読み込みエラー時のフォールバック
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : null}
                        <div className={`text-center ${log.image_path && log.image_path.startsWith('https://') ? 'hidden' : ''}`}>
                            <div className="text-4xl">🖼️</div>
                            <div className="text-xs text-gray-500 mt-1">画像</div>
                        </div>
                    </div>
                </div>

                {/* メイン情報 */}
                <div className="flex-1 min-w-0">
                    {/* 日時 - スマホ時のみ上に表示 */}
                    <div className="flex justify-start mb-2 md:hidden">
                        <span className="text-sm text-gray-500">
                            {formatAbsoluteTime(log.created_at)}
                        </span>
                    </div>

                    {/* PC表示用のレイアウト */}
                    <div className="hidden md:flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* 成功/失敗ステータス */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {log.success ? '✅ 成功' : '❌ 失敗'}
                            </span>

                            {/* 分類バッジ */}
                            {log.success && log.classification && (
                                <button
                                    onClick={() => onClassificationClick?.(log.classification!)}
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border ${getClassificationColor(log.classification)}`}
                                    title={`分類「${getClassificationName(log.classification)}」でフィルターする`}
                                >
                                    🏷️ {getClassificationName(log.classification)}
                                </button>
                            )}
                        </div>

                        {/* 日時 - PC時は右側に表示 */}
                        <span className="text-sm text-gray-500">
                            {formatAbsoluteTime(log.created_at)}
                        </span>
                    </div>

                    {/* スマホ表示用のレイアウト */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap md:hidden">
                        {/* 成功/失敗ステータス */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {log.success ? '✅ 成功' : '❌ 失敗'}
                        </span>

                        {/* 分類バッジ */}
                        {log.success && log.classification && (
                            <button
                                onClick={() => onClassificationClick?.(log.classification!)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border ${getClassificationColor(log.classification)}`}
                                title={`分類「${getClassificationName(log.classification)}」でフィルターする`}
                            >
                                🏷️ {getClassificationName(log.classification)}
                            </button>
                        )}
                    </div>

                    {/* 画像パス */}
                    <div className="mb-3">
                        <p className="text-sm text-gray-600 truncate" title={log.image_path}>
                            📁 {log.image_path.startsWith('https://')
                                ? log.image_path.split('/').pop() || log.image_path
                                : log.image_path}
                        </p>
                    </div>

                    {/* 信頼度プログレスバー */}
                    {log.success && log.classification && (
                        <div className="mb-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">信頼度</span>
                                <span className="font-bold text-gray-900">{confidencePercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${confidencePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* 処理時間 */}
                    <div className="text-xs text-gray-500">
                        ⏱️ 処理時間: {log.processing_time_ms}ms
                    </div>
                </div>
            </div>
        </div>
    );
}
