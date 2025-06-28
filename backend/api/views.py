import os
import random
import time
from datetime import datetime

import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AiAnalysisLog

# GCP Functions URL (環境変数から取得)
MOCK_AI_ANALYSIS_API_URL = os.getenv('MOCK_AI_ANALYSIS_API_URL')


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

    # リクエストの画像パス取得
    image_path = request.data.get('image_path')

    if not image_path:
        return Response({
            'success': False,
            'message': 'image_path is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    print(f"🔍 Analyzing image: {image_path}")

    # 環境に応じたAPI呼び出し
    analysis_result = call_mock_ai_analysis_api(image_path)

    response_timestamp = datetime.now()
    processing_time_ms = int(
        (response_timestamp - request_timestamp).total_seconds() * 1000)

    print(f"✅ Analysis result: {analysis_result}")

    # DB保存処理
    try:
        analysis_log = AiAnalysisLog.objects.create(
            image_path=image_path,
            success=analysis_result['success'],
            message=analysis_result['message'],
            classification=analysis_result['estimated_data'].get(
                'class') if analysis_result['success'] else None,
            confidence=analysis_result['estimated_data'].get(
                'confidence') if analysis_result['success'] else None,
            request_timestamp=request_timestamp,
            response_timestamp=response_timestamp
        )

        print(f"💾 Saved to DB with ID: {analysis_log.id}")

        if analysis_result['success']:
            return Response({
                'id': analysis_log.id,
                'success': True,
                'message': 'Analysis completed',
                'result': {
                    'class': analysis_result['estimated_data']['class'],
                    'confidence': analysis_result['estimated_data']['confidence'],
                    'processing_time_ms': processing_time_ms
                }
            })
        else:
            return Response({
                'id': analysis_log.id,
                'success': False,
                'message': analysis_result['message'],
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


def call_mock_ai_analysis_api(image_path):
    """
    環境に応じてAPI呼び出し先を切り替え
    """
    if MOCK_AI_ANALYSIS_API_URL:
        print("🌤️ Using GCP Cloud Functions")
        return call_mock_ai_analysis_api_gcp(image_path)
    else:
        print("🏠 Using local mock")
        return call_mock_ai_analysis_api_local(image_path)


def call_mock_ai_analysis_api_local(image_path):
    """
    ローカル開発用のモック処理
    """
    processing_time = random.uniform(0.3, 1.2)
    time.sleep(processing_time)

    # 80%の確率で成功、20%で失敗
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


def call_mock_ai_analysis_api_gcp(image_path):
    """
    GCP Cloud Functions API呼び出し
    """
    try:
        print(f"🌤️ Calling GCP Functions: {MOCK_AI_ANALYSIS_API_URL}")

        response = requests.post(
            MOCK_AI_ANALYSIS_API_URL,
            json={'image_path': image_path},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ GCP API Error: {response.status_code}")
            return {
                'success': False,
                'message': f'GCP API Error: {response.status_code}',
                'estimated_data': {}
            }

    except requests.RequestException as e:
        print(f"💥 Request Error: {str(e)}")
        return {
            'success': False,
            'message': f'API Request Error: {str(e)}',
            'estimated_data': {}
        }
