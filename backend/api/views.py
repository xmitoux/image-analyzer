import random
import time
from typing import Any, Dict

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import AiAnalysisLog
from .services import analyze_image_from_gcs_path, upload_image_to_gcs


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
@parser_classes([MultiPartParser, FormParser])
def analyze_image(request):
    """
    本番環境用: 画像ファイルをアップロードしてVision APIで解析
    """
    request_timestamp = timezone.now()

    # 画像ファイルが必須
    if 'image' not in request.FILES:
        return Response({
            'success': False,
            'message': 'image file is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    print(
        f"📁 Received image file: {image_file.name} ({image_file.size} bytes)")

    try:
        # 画像ファイルをGCSにアップロード
        upload_result = upload_image_to_gcs(image_file)

        if not upload_result['success']:
            return Response({
                'success': False,
                'message': f'Failed to upload image: {upload_result["message"]}'
            }, status=status.HTTP_400_BAD_REQUEST)

        gcs_path = upload_result['gcs_path']
        print(f"☁️ Image uploaded to GCS: {gcs_path}")

        # GCSパスからVision API解析を実行
        analysis_result = analyze_image_from_gcs_path(gcs_path)
        image_path = gcs_path

        response_timestamp = timezone.now()
        processing_time_ms = int(
            (response_timestamp - request_timestamp).total_seconds() * 1000)

        print(f"✅ Analysis result: {analysis_result}")

        # DB保存処理
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
        print(f"💥 Analysis Error: {str(e)}")
        return Response({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@parser_classes([JSONParser])
def analyze_image_mock(request):
    """
    ローカル開発用: image_pathでモック解析
    """
    request_timestamp = timezone.now()

    image_path = request.data.get('image_path')

    if not image_path:
        return Response({
            'success': False,
            'message': 'image_path is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # ローカルモック解析のみ
        print(" Using local mock")
        analysis_result = call_mock_ai_analysis_api_local(image_path)

        response_timestamp = timezone.now()

        print(f"✅ Analysis result: {analysis_result}")

        # DB保存処理
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
        print(f"💥 Analysis Error: {str(e)}")
        return Response({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
