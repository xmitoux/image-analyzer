'use client';

import { LogCard } from '@/components/LogCard';
import { getClassificationColor } from '@/lib/utils';
import { ApiResponse } from '@/types/analysis';
import Link from 'next/link';
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

    // 現在のフィルターに対応する分類名を取得
    const getCurrentClassificationName = useCallback(() => {
        if (!currentClassification) return '';
        const classificationId = Number(currentClassification);
        const matchingLog = logs.find(log => log.classification === classificationId);
        return matchingLog?.classification_name
    }, [currentClassification, logs]);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        📜 画像分析ログ一覧
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                        画像解析結果の履歴を確認する
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            🖼️ 新しい画像を解析
                        </Link>
                    </div>
                </div>

                {/* 統計情報 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            {currentClassification ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="font-medium">フィルター中:</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getClassificationColor(Number(currentClassification))}`}>
                                            {getCurrentClassificationName()}
                                        </span>
                                        <button
                                            onClick={() => handleClassificationChange('')}
                                            className="text-blue-600 hover:text-blue-800 text-xs underline whitespace-nowrap"
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
                                <span>総件数: {pagination.total_count}件</span>
                                <span className="hidden sm:inline">|</span>
                                <span className="text-xs">
                                    {((pagination.current_page - 1) * pagination.page_size) + 1} - {Math.min(pagination.current_page * pagination.page_size, pagination.total_count)}件目を表示
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ログカード一覧 */}
                {logs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
