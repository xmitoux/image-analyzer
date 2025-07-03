'use client';

import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { LogCard } from '@/components/LogCard';
import { Pagination } from '@/components/Pagination';
import { useFilterLoading } from '@/hooks/useFilterLoading';
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
    const { isLoading, startLoading } = useFilterLoading();

    const currentClassification = searchParams.get('classification') || '';

    const handleClassificationChange = useCallback((classification: string) => {
        // 同じフィルタの場合は何もしない（無限ローディングを防ぐ）
        if (classification === currentClassification) {
            return;
        }

        startLoading(); // ローディング開始
        const params = new URLSearchParams(searchParams);
        if (classification) {
            params.set('classification', classification);
        } else {
            params.delete('classification');
        }
        params.delete('page'); // フィルター変更時はページを1にリセット
        router.push(`/analysis-logs?${params.toString()}`);
    }, [router, searchParams, startLoading, currentClassification]);

    const handlePageChange = useCallback((page: number) => {
        // 同じページの場合は何もしない（無限ローディングを防ぐ）
        if (page === pagination.current_page) {
            return;
        }

        startLoading(); // ローディング開始
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`/analysis-logs?${params.toString()}`);
    }, [router, searchParams, startLoading, pagination.current_page]);

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
                <AppHeader
                    title="📜 画像解析ログ一覧"
                    subtitle="画像解析結果の履歴を確認する"
                    actionButton={{
                        text: "新しい画像を解析",
                        href: "/",
                        icon: "🖼️"
                    }}
                />

                {/* 統計情報とフィルター */}
                <FilterBar
                    currentClassification={currentClassification}
                    currentClassificationName={getCurrentClassificationName() || undefined}
                    totalCount={pagination.total_count}
                    currentPage={pagination.current_page}
                    pageSize={pagination.page_size}
                    totalItems={pagination.total_count}
                    onClearFilter={() => handleClassificationChange('')}
                    isLoading={isLoading}
                />

                {/* ローディング状態のオーバーレイ */}
                {isLoading && (
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <div className="text-sm text-gray-600">フィルタリング中...</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ログカード一覧 */}
                {logs.length > 0 ? (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isLoading ? 'opacity-50' : ''}`}>
                        {logs.map((log) => (
                            <LogCard
                                key={log.id}
                                log={log}
                                onClassificationClick={(classification) => handleClassificationChange(classification.toString())}
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center ${isLoading ? 'opacity-50' : ''}`}>
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-gray-900 font-medium mb-2">ログがありません</h3>
                        <p className="text-gray-600">まだ画像分析が実行されていません。</p>
                    </div>
                )}

                {/* ページネーション */}
                <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    className="mt-8"
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}
