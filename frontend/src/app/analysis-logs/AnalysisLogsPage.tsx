'use client';

import { LogCard } from '@/components/LogCard';
import { getClassificationColor, getClassificationName } from '@/lib/utils';
import { ApiResponse } from '@/types/analysis';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type AnalysisLogsPageProps = {
    data: ApiResponse;
}

export default function AnalysisLogsPage({ data }: AnalysisLogsPageProps) {
    const { logs, pagination } = data.data;
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentClassification = searchParams.get('classification') || '';

    const handleClassificationChange = useCallback((classification: string) => {
        const params = new URLSearchParams(searchParams);
        if (classification) {
            params.set('classification', classification);
        } else {
            params.delete('classification');
        }
        params.delete('page'); // フィルター変更時はページを1にリセット
        router.push(`/analysis-logs?${params.toString()}`);
    }, [router, searchParams]);

    const handlePageChange = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`/analysis-logs?${params.toString()}`);
    }, [router, searchParams]);

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
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {currentClassification ? (
                                <div className="flex items-center gap-2">
                                    <span>フィルター中:</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getClassificationColor(Number(currentClassification))}`}>
                                        🏷️ {getClassificationName(Number(currentClassification))}
                                    </span>
                                    <button
                                        onClick={() => handleClassificationChange('')}
                                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                                    >
                                        フィルターをクリア
                                    </button>
                                </div>
                            ) : (
                                <span>分類タグをクリックして絞り込みができます</span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            総件数: {pagination.total_count}件
                            <span className="ml-2">
                                ({((pagination.current_page - 1) * pagination.page_size) + 1} - {Math.min(pagination.current_page * pagination.page_size, pagination.total_count)}件目を表示)
                            </span>
                        </div>
                    </div>
                </div>

                {/* ログカード一覧 */}
                {logs.length > 0 ? (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <LogCard
                                key={log.id}
                                log={log}
                                onClassificationClick={(classification) => handleClassificationChange(classification.toString())}
                            />
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
                    <div className="flex items-center gap-3">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pagination.has_previous
                                ? 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-500'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                }`}
                            disabled={!pagination.has_previous}
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                        >
                            前へ
                        </button>

                        {/* ページ番号表示 */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                let pageNum;
                                if (pagination.total_pages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.current_page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.current_page >= pagination.total_pages - 2) {
                                    pageNum = pagination.total_pages - 4 + i;
                                } else {
                                    pageNum = pagination.current_page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pageNum === pagination.current_page
                                            ? 'bg-blue-600 text-white border border-blue-600'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                                            }`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pagination.has_next
                                ? 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-500'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                }`}
                            disabled={!pagination.has_next}
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                        >
                            次へ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
