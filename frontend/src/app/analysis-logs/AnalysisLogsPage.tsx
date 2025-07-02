'use client';

import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { LogCard } from '@/components/LogCard';
import { Pagination } from '@/components/Pagination';
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
                    title="📜 画像分析ログ一覧"
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
                />

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

                {/* ページネーション */}
                <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    className="mt-8"
                />
            </div>
        </div>
    );
}
