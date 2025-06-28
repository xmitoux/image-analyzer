import random
import time
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


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

    # Mock AI API呼び出し（本当はHTTPリクエスト）
    ai_result = call_mock_ai_api(image_path)

    response_timestamp = datetime.now()
    processing_time_ms = int(
        (response_timestamp - request_timestamp).total_seconds() * 1000)

    print(f"✅ Analysis result: {ai_result}")

    # TODO: ここでデータベース保存処理（後で実装）💾

    # 課題仕様に合わせたレスポンス形式
    if ai_result['success']:
        return Response({
            'id': random.randint(100, 999),  # 仮のID
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
            'id': random.randint(100, 999),
            'success': False,
            'message': ai_result['message'],
            'result': {
                'processing_time_ms': processing_time_ms
            }
        })


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
