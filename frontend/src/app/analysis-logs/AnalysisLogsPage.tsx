import { LogCard } from '@/components/LogCard';
import { ApiResponse } from '@/types/analysis';

type AnalysisLogsPageProps = {
    data: ApiResponse;
}

export default function AnalysisLogsPage({ data }: AnalysisLogsPageProps) {
    const { logs, pagination } = data.data;

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

                {/* 統計情報 */}
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
                            総件数: {pagination.total_count}件
                        </div>
                    </div>
                </div>

                {/* ログカード一覧 */}
                {logs.length > 0 ? (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <LogCard key={log.id} log={log} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-gray-900 font-medium mb-2">ログがありません</h3>
                        <p className="text-gray-600">まだ画像分析が実行されていません。</p>
                    </div>
                )}

                {/* ページネーション情報 */}
                <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={!pagination.has_previous}
                        >
                            前へ
                        </button>
                        <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
                            {pagination.current_page} / {pagination.total_pages}
                        </span>
                        <button
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={!pagination.has_next}
                        >
                            次へ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
