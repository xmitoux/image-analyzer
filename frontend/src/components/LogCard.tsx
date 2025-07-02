import { AnalysisLog } from '@/types/analysis';
import { ClassificationTag } from './ClassificationTag';
import { ClientTime } from './ClientTime';
import { ConfidenceBar } from './ConfidenceBar';
import { ImagePreview } from './ImagePreview';
import { ProcessingTime } from './ProcessingTime';
import { StatusBadge } from './StatusBadge';

type LogCardProps = {
    log: AnalysisLog;
    onClassificationClick?: (classification: number) => void;
}

export function LogCard({ log, onClassificationClick }: LogCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
            {/* 画像プレビュー部分 */}
            <div className="w-full mb-4">
                <ImagePreview
                    imagePath={log.image_path}
                    alt="解析画像"
                    size="md"
                />
            </div>

            {/* メイン情報 */}
            <div className="flex-1 flex flex-col">
                {/* 日時 */}
                <div className="flex justify-start mb-3">
                    <ClientTime
                        dateString={log.created_at}
                        className="text-sm text-gray-500"
                    />
                </div>

                {/* ステータスと分類バッジ */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <StatusBadge success={log.success} />

                    {log.success && log.classification && (
                        <ClassificationTag
                            classificationId={log.classification}
                            classificationName={log.classification_name || ''}
                            onClick={onClassificationClick}
                        />
                    )}
                </div>

                {/* 信頼度プログレスバー */}
                {log.success && log.classification && (
                    <ConfidenceBar
                        confidence={log.confidence}
                        className="mt-auto"
                    />
                )}

                {/* 処理時間 */}
                <ProcessingTime timeMs={log.processing_time_ms} />
            </div>
        </div>
    );
}
