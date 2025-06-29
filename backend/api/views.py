import base64
import os
import random
import time
from typing import Any, Dict

import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AiAnalysisLog
from .services import VisionAPIService, analyze_image_with_vision_api

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


@api_view(['GET'])
def test_vision_quickstart(request):
    """Google Cloud Vision API接続テスト（公式サンプル）"""
    try:
        print("🔍 Running Vision API quickstart test...")
        result = VisionAPIService.run_quickstart()

        if result['success']:
            return Response({
                'success': True,
                'message': 'Vision API connection successful!',
                'result': result
            })
        else:
            return Response({
                'success': False,
                'message': f'Vision API test failed: {result["error"]}',
                'result': result
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Quickstart test failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def test_base64_image(request):
    """base64画像データのテスト用エンドポイント"""
    try:
        image_data = request.data.get('image_data')

        if not image_data:
            return Response({
                'success': False,
                'message': 'image_data is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        print(f"🔍 Received image_data length: {len(image_data)}")
        print(f"🔍 Image data starts with: {image_data[:50]}...")

        # データURL形式の確認
        if image_data.startswith('data:image/'):
            print("📷 Detected data URL format")
            image_data = image_data.split(',', 1)[1]
            print(f"📷 After removing data URL prefix: {len(image_data)} chars")

        try:
            # base64デコードテスト
            decoded_data = base64.b64decode(image_data)
            print(
                f"✅ Successfully decoded base64, size: {len(decoded_data)} bytes")

            # 画像ヘッダーの確認
            if decoded_data.startswith(b'\xff\xd8\xff'):
                print("📷 Detected JPEG format")
            elif decoded_data.startswith(b'\x89PNG'):
                print("📷 Detected PNG format")
            elif decoded_data.startswith(b'GIF'):
                print("📷 Detected GIF format")
            else:
                print(f"❓ Unknown format, starts with: {decoded_data[:10]}")

            # Vision APIで解析
            service = VisionAPIService()
            result = service.analyze_image(decoded_data, ['labels'])

            return Response({
                'success': True,
                'message': 'Base64 image processing test completed',
                'debug_info': {
                    'original_length': len(request.data.get('image_data')),
                    'processed_length': len(image_data),
                    'decoded_size': len(decoded_data)
                },
                'result': result
            })

        except Exception as decode_error:
            return Response({
                'success': False,
                'message': f'Base64 decode error: {str(decode_error)}',
                'debug_info': {
                    'image_data_length': len(image_data),
                    'starts_with': image_data[:20] if len(image_data) > 20 else image_data
                }
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Test failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def analyze_image_vision_api(request):
    """Google Cloud Vision APIを使用した画像解析"""
    request_timestamp = timezone.now()

    # リクエストデータの取得
    image_data = request.data.get('image_data')  # base64エンコードされた画像データ
    image_path = request.data.get('image_path')  # 画像パス（ローカルファイルの場合）
    analysis_types = request.data.get('analysis_types', ['labels', 'text'])

    if not image_data and not image_path:
        return Response({
            'success': False,
            'message': 'image_data or image_path is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 画像データの準備
        if image_path:
            # ローカルファイルパスの場合
            with open(image_path, 'rb') as image_file:
                image_content = image_file.read()
        else:
            # base64データの場合
            image_content = image_data

        print(f"🔍 Analyzing image with Vision API...")

        # Vision APIで解析
        analysis_result = analyze_image_with_vision_api(
            image_content=image_content,
            analysis_types=analysis_types
        )

        response_timestamp = timezone.now()
        processing_time_ms = int(
            (response_timestamp - request_timestamp).total_seconds() * 1000)

        # DB保存処理
        analysis_log = AiAnalysisLog.objects.create(
            image_path=image_path or 'base64_data',
            success=analysis_result['success'],
            message='Vision API Analysis',
            classification=None,  # 一時的にNullに設定（後で数値マッピング機能を実装予定）
            confidence=_extract_top_confidence(
                analysis_result) if analysis_result['success'] else None,
            request_timestamp=request_timestamp,
            response_timestamp=response_timestamp
        )

        if analysis_result['success']:
            return Response({
                'id': analysis_log.id,
                'success': True,
                'message': 'Vision API analysis completed',
                'result': {
                    'analysis_results': analysis_result['results'],
                    'top_label': _extract_top_label(analysis_result),
                    'top_confidence': _extract_top_confidence(analysis_result),
                    'processing_time_ms': processing_time_ms
                }
            })
        else:
            return Response({
                'id': analysis_log.id,
                'success': False,
                'message': f'Vision API analysis failed: {analysis_result.get("error", "Unknown error")}',
                'processing_time_ms': processing_time_ms
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except FileNotFoundError:
        return Response({
            'success': False,
            'message': f'Image file not found: {image_path}'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _extract_top_label(analysis_result: Dict[str, Any]) -> str:
    """解析結果から最上位のラベルを抽出"""
    results = analysis_result.get('results', {})
    labels = results.get('labels', [])
    if labels:
        return labels[0].get('description', 'Unknown')
    return 'No labels detected'


def _extract_top_confidence(analysis_result: Dict[str, Any]) -> float:
    """解析結果から最上位のラベルの信頼度を抽出"""
    results = analysis_result.get('results', {})
    labels = results.get('labels', [])
    if labels:
        return labels[0].get('confidence', 0.0)
    return 0.0


@api_view(['POST'])
def analyze_image(request):
    request_timestamp = timezone.now()

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

    response_timestamp = timezone.now()
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
