import random
import time
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AiAnalysisLog


@api_view(['GET'])
def hello_world(request):
    return Response({
        'message': 'Hello World from Django API! 🎉',
        'status': 'success',
        'data': {
            'version': '1.0.0',
            'project': 'Image Analyzer'
        }
    })


@api_view(['POST'])
def analyze_image(request):
    request_timestamp = datetime.now()

    # 画像パス取得
    image_path = request.data.get('image_path')

    if not image_path:
        return Response({
            'success': False,
            'message': 'image_path is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    print(f"🔍 Analyzing image: {image_path}")

    # Mock AI API呼び出し
    ai_result = call_mock_ai_api(image_path)

    response_timestamp = datetime.now()
    processing_time_ms = int(
        (response_timestamp - request_timestamp).total_seconds() * 1000)

    print(f"✅ Analysis result: {ai_result}")

    # DB保存処理
    try:
        analysis_log = AiAnalysisLog.objects.create(
            image_path=image_path,
            success=ai_result['success'],
            message=ai_result['message'],
            classification=ai_result['estimated_data'].get('class') if ai_result['success'] else None,
            confidence=ai_result['estimated_data'].get('confidence') if ai_result['success'] else None,
            request_timestamp=request_timestamp,
            response_timestamp=response_timestamp
        )

        print(f"💾 Saved to DB with ID: {analysis_log.id}")

        # 課題仕様に合わせたレスポンス形式
        if ai_result['success']:
            return Response({
                'id': analysis_log.id,
                'success': True,
                'message': 'Analysis completed',
                'result': {
                    'class': ai_result['estimated_data']['class'],
                    'confidence': ai_result['estimated_data']['confidence'],
                    'processing_time_ms': processing_time_ms
                }
            })
        else:
            return Response({
                'id': analysis_log.id,
                'success': False,
                'message': ai_result['message'],
                'result': {
                    'processing_time_ms': processing_time_ms
                }
            })

    except Exception as e:
        print(f"💥 DB Save Error: {str(e)}")
        return Response({
            'success': False,
            'message': f'Database error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def call_mock_ai_api(image_path):
    """
    外部AI APIを模したモック処理🤖
    実際はGCP Cloud Functionsにリクエスト投げる想定
    """
    # API処理時間をリアルにシミュレート⏰
    processing_time = random.uniform(0.3, 1.2)
    time.sleep(processing_time)

    # 80%の確率で成功、20%で失敗（リアルなAPI感）
    if random.random() > 0.2:
        return {
            'success': True,
            'message': 'success',
            'estimated_data': {
                'class': random.randint(1, 5),
                'confidence': round(random.uniform(0.7, 0.95), 4)
            }
        }
    else:
        return {
            'success': False,
            'message': 'Error:E50012',
            'estimated_data': {}
        }
