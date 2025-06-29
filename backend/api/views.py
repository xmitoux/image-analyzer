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
from .services import analyze_image_objects_for_classification

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
    request_timestamp = timezone.now()

    # リクエストの画像データ取得（image_pathまたはimage_dataのどちらでも対応）
    image_path = request.data.get('image_path')
    image_data = request.data.get('image_data')

    if not image_path and not image_data:
        return Response({
            'success': False,
            'message': 'image_path or image_data is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 画像データの準備
        if image_path:
            print(f"🔍 Analyzing image from path: {image_path}")
            image_content = image_path  # ファイルパスはそのまま渡す
        else:
            print(
                f"🔍 Analyzing image from base64 data (length: {len(image_data)})")
            image_content = image_data

        # 環境に応じたAPI呼び出し
        analysis_result = call_mock_ai_analysis_api(image_content)

        response_timestamp = timezone.now()
        processing_time_ms = int(
            (response_timestamp - request_timestamp).total_seconds() * 1000)

        print(f"✅ Analysis result: {analysis_result}")

        # DB保存処理
        try:
            analysis_log = AiAnalysisLog.objects.create(
                image_path=image_path or 'base64_data',
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
                    'message': 'success',
                    'estimated_data': {
                        'class': analysis_result['estimated_data']['class'],
                        'confidence': analysis_result['estimated_data']['confidence']
                    }
                })
            else:
                return Response({
                    'id': analysis_log.id,
                    'success': False,
                    'message': analysis_result['message'],
                    'estimated_data': {}
                })

        except Exception as e:
            print(f"💥 DB Save Error: {str(e)}")
            return Response({
                'success': False,
                'message': f'Database error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        print(f"💥 Analysis Error: {str(e)}")
        return Response({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def call_mock_ai_analysis_api(image_content):
    """
    環境に応じてAPI呼び出し先を切り替え
    """
    # Google Cloud認証情報が設定されている場合はVision APIを使用
    if os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
        print("🌤️ Using Google Cloud Vision API")
        return call_vision_api_analysis(image_content)
    elif MOCK_AI_ANALYSIS_API_URL:
        print("🌤️ Using GCP Cloud Functions")
        return call_mock_ai_analysis_api_gcp(image_content)
    else:
        print("🏠 Using local mock")
        return call_mock_ai_analysis_api_local(image_content)


def call_vision_api_analysis(image_content):
    """
    Google Cloud Vision APIを使用した画像解析
    """
    # ファイルパスの場合は読み込み（有効なファイルパスかチェック）
    if isinstance(image_content, str) and not image_content.startswith('data:'):
        # ファイルパスの長さと有効性をチェック
        if len(image_content) < 255 and not any(char in image_content for char in '=+/'):
            # 一般的なファイル拡張子を持つかチェック
            if image_content.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp')):
                try:
                    with open(image_content, 'rb') as image_file:
                        image_content = image_file.read()
                except FileNotFoundError:
                    return {
                        'success': False,
                        'message': f'Image file not found: {image_content}',
                        'estimated_data': {}
                    }
                except Exception as e:
                    return {
                        'success': False,
                        'message': f'Error reading file: {str(e)}',
                        'estimated_data': {}
                    }
            else:
                # ファイル拡張子がない場合、base64データとして扱う
                pass
        else:
            # 長いデータやbase64らしい文字を含む場合、base64データとして扱う
            pass

    return analyze_image_objects_for_classification(image_content)


def call_mock_ai_analysis_api_local(image_content):
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


def call_mock_ai_analysis_api_gcp(image_content):
    """
    GCP Cloud Functions API呼び出し
    """
    try:
        # ファイルパスの場合はそのまま送信（既存の仕様に合わせる）
        if isinstance(image_content, str) and not image_content.startswith('data:'):
            request_data = {'image_path': image_content}
        else:
            # base64データの場合は適切に処理
            request_data = {'image_data': image_content}

        print(f"🌤️ Calling GCP Functions: {MOCK_AI_ANALYSIS_API_URL}")

        response = requests.post(
            MOCK_AI_ANALYSIS_API_URL,
            json=request_data,
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
