import { ApiResponse } from '@/types/analysis';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function getAnalysisLogs(page = 1, pageSize = 20, classification?: number) {
    const url = new URL(`${API_BASE_URL}/api/logs/`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('page_size', pageSize.toString());

    if (classification) {
        url.searchParams.set('classification', classification.toString());
    }

    try {
        const response = await fetch(url.toString(), {
            cache: 'no-store', // 常に最新データを取得
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'APIからのデータ取得に失敗しました');
        }

        return data;
    } catch (error) {
        console.error('ログ取得エラー:', error);
        throw error;
    }
}
