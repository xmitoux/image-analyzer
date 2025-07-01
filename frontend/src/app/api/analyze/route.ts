import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // バックエンドのURL
        const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';

        // バックエンドにプロキシリクエスト
        const response = await fetch(`${apiBaseUrl}/api/analyze/`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Backend API Error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Analyze API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。',
                error: error instanceof Error ? error.message : '不明なエラー'
            },
            { status: 500 }
        );
    }
}
