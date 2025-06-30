'use client';

type AnalysisLog = {
    id: number;
    image_path: string;
    success: boolean;
    classification: number | null;
    confidence: string;
    processing_time_ms: number;
    created_at: string;
}

// モックデータ
const mockLogs: AnalysisLog[] = [
    {
        id: 30,
        image_path: "gs://image-analyzer-0919/images/20250629_153414_f9f70916.jpg",
        success: true,
        classification: 3,
        confidence: "0.9503",
        processing_time_ms: 1829,
        created_at: "2025-06-29T15:34:16.071777Z"
    },
    {
        id: 29,
        image_path: "hoge",
        success: true,
        classification: 5,
        confidence: "0.8652",
        processing_time_ms: 1162,
        created_at: "2025-06-29T13:58:25.170511Z"
    },
    {
        id: 28,
        image_path: "mock/test",
        success: true,
        classification: 4,
        confidence: "0.9004",
        processing_time_ms: 913,
        created_at: "2025-06-29T09:26:38.415959Z"
    },
    {
        id: 25,
        image_path: "gs://image-analyzer-0919/images/20250629_092229_7e49af8f.png",
        success: false,
        classification: null,
        confidence: "0.0000",
        processing_time_ms: 1660,
        created_at: "2025-06-29T09:22:31.437187Z"
    },
    {
        id: 24,
        image_path: "gs://image-analyzer-0919/images/20250629_071559_95b92e70.jpg",
        success: true,
        classification: 3,
        confidence: "0.9503",
        processing_time_ms: 1327,
        created_at: "2025-06-29T07:16:00.819913Z"
    }
];

function formatAbsoluteTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function getClassificationName(classification: number | null): string {
    if (!classification) return "未分類";
    return `ラベル ID: ${classification}`;
}

function getClassificationColor(classification: number | null): string {
    if (!classification) return "bg-gray-100 text-gray-800";

    // IDに基づいてカラフルな色を生成（ハッシュベース）
    const colors = [
        "bg-red-100 text-red-800",
        "bg-orange-100 text-orange-800",
        "bg-amber-100 text-amber-800",
        "bg-yellow-100 text-yellow-800",
        "bg-lime-100 text-lime-800",
        "bg-green-100 text-green-800",
        "bg-emerald-100 text-emerald-800",
        "bg-teal-100 text-teal-800",
        "bg-cyan-100 text-cyan-800",
        "bg-sky-100 text-sky-800",
        "bg-blue-100 text-blue-800",
        "bg-indigo-100 text-indigo-800",
        "bg-violet-100 text-violet-800",
        "bg-purple-100 text-purple-800",
        "bg-fuchsia-100 text-fuchsia-800",
        "bg-pink-100 text-pink-800",
        "bg-rose-100 text-rose-800"
    ];

    return colors[classification % colors.length];
}

function LogCard({ log }: { log: AnalysisLog }) {
    const confidencePercentage = Math.round(parseFloat(log.confidence) * 100);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                {/* 画像プレビュー部分 */}
                <div className="flex-shrink-0">
                    <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        <div className="text-center">
                            <div className="text-4xl">🖼️</div>
                            <div className="text-xs text-gray-500 mt-1">画像</div>
                        </div>
                    </div>
                </div>                {/* メイン情報 */}
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
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(log.classification)}`}>
                                    {getClassificationName(log.classification)}
                                </span>
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
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(log.classification)}`}>
                                {getClassificationName(log.classification)}
                            </span>
                        )}
                    </div>

                    {/* 画像パス */}
                    <div className="mb-3">
                        <p className="text-sm text-gray-600 truncate" title={log.image_path}>
                            📁 {log.image_path}
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

export default function AnalysisLogsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        画像分析ログ一覧
                    </h1>
                    <p className="text-gray-600">
                        AI画像分析の履歴と結果を確認できます
                    </p>
                </div>

                {/* フィルター（後で実装予定） */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            フィルター:
                        </div>
                        <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                            <option value="">全ての分類</option>
                            <option value="1">ラベル ID: 1</option>
                            <option value="2">ラベル ID: 2</option>
                            <option value="3">ラベル ID: 3</option>
                            <option value="4">ラベル ID: 4</option>
                            <option value="5">ラベル ID: 5</option>
                        </select>
                        <div className="text-sm text-gray-500 ml-auto">
                            総件数: {mockLogs.length}件
                        </div>
                    </div>
                </div>

                {/* ログカード一覧 */}
                <div className="space-y-4">
                    {mockLogs.map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))}
                </div>

                {/* ページネーション（後で実装予定） */}
                <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
                            前へ
                        </button>
                        <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
                            1
                        </span>
                        <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            次へ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
