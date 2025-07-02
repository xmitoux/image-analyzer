import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // バックエンドのURL
        const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';

        console.log('🔄 リクエスト開始:', `${apiBaseUrl}/api/analyze/`);

        // バックエンドにリクエスト
        const response = await fetch(`${apiBaseUrl}/api/analyze/`, {
            method: 'POST',
            body: formData,
        });

        console.log('📡 バックエンドレスポンス:', response.status, response.statusText);

        if (!response.ok) {
            // エラーレスポンスの詳細を取得
            let errorMessage = `Backend API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.error('❌ バックエンドエラー詳細:', errorData);
                errorMessage = errorData.message || errorMessage;

                return NextResponse.json({
                    success: false,
                    message: errorMessage,
                    error: errorData,
                    status: response.status
                }, { status: response.status });
            } catch (parseError) {
                console.error('❌ エラーレスポンス解析失敗:', parseError);
                const errorText = await response.text();
                console.error('❌ エラーレスポンス生テキスト:', errorText);

                return NextResponse.json({
                    success: false,
                    message: errorMessage,
                    error: errorText,
                    status: response.status
                }, { status: response.status });
            }
        }

        const data = await response.json();
        console.log('✅ バックエンド成功レスポンス:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error('💥 Analyze API Error:', error);
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
