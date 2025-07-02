'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // エラーをログに記録
        console.error('Analysis logs page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <div className="text-red-600 text-2xl mr-3">❌</div>
                        <div>
                            <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
                            <p className="text-red-600 text-sm mt-1">
                                {error.message || 'データの取得に失敗しました'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        再試行
                    </button>
                </div>
            </div>
        </div>
    );
}
