import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json({
                success: false,
                message: 'image file is required'
            }, { status: 400 });
        }

        // バックエンドのURL
        const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';

        // 環境変数でVision APIを使うかモックを使うかを決定
        const useVisionAPI = process.env.USE_VISION_API === 'true';

        if (useVisionAPI) {
            // Vision APIを使用する場合
            console.log('🔄 Vision API リクエスト開始:', `${apiBaseUrl}/api/analyze/`);

            const response = await fetch(`${apiBaseUrl}/api/analyze/`, {
                method: 'POST',
                body: formData,
            });

            return await handleBackendResponse(response, 'Vision API');

        } else {
            // モックAPIを使用する場合
            const mockImagePath = `/image/mock/${Date.now()}/${imageFile.name}`;

            console.log('🔄 モックAPI リクエスト開始:', `${apiBaseUrl}/api/analyze-mock/`);
            console.log('📁 モック画像パス:', mockImagePath);

            const response = await fetch(`${apiBaseUrl}/api/analyze-mock/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_path: mockImagePath
                }),
            });

            return await handleBackendResponse(response, 'モックAPI');
        }

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

// エラーハンドリングを共通化する関数
async function handleBackendResponse(response: Response, apiType: string) {
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
    console.log(`✅ ${apiType} 成功レスポンス:`, data);
    return NextResponse.json(data);
}
