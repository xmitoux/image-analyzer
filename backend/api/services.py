"""
Google Cloud Vision API サービス
"""
import os
import uuid
from datetime import datetime
from typing import Dict, Union

from google.cloud import storage, vision
from PIL import Image


def upload_image_to_gcs(image_file, bucket_name: str = None) -> Dict:
    """
    画像ファイルをGoogle Cloud Storageにアップロードする

    Args:
        image_file: アップロードする画像ファイル
        bucket_name: GCSバケット名（環境変数から取得）

    Returns:
        {
            'success': bool,
            'message': str,
            'gcs_path': str,  # gs://bucket/path/to/file.jpg
            'public_url': str  # 公開URL
        }
    """
    try:
        # バケット名の取得
        if not bucket_name:
            bucket_name = os.getenv('GCS_BUCKET_NAME')

        if not bucket_name:
            return {
                'success': False,
                'message': 'GCS bucket name not configured',
                'gcs_path': '',
                'public_url': ''
            }

        # Google Cloud認証情報が設定されているかチェック
        if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
            return {
                'success': False,
                'message': 'Google Cloud credentials not configured',
                'gcs_path': '',
                'public_url': ''
            }

        # 画像の形式チェック
        try:
            image = Image.open(image_file)
            image.verify()  # 画像が有効かチェック
            image_file.seek(0)  # ファイルポインタをリセット

            # 対応フォーマットをチェック
            if image.format not in ['JPEG', 'PNG', 'GIF', 'BMP', 'WEBP']:
                return {
                    'success': False,
                    'message': f'Unsupported image format: {image.format}',
                    'gcs_path': '',
                    'public_url': ''
                }

        except Exception as e:
            return {
                'success': False,
                'message': f'Invalid image file: {str(e)}',
                'gcs_path': '',
                'public_url': ''
            }

        # ファイル名の生成（タイムスタンプ + UUID）
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        file_extension = image.format.lower()
        if file_extension == 'jpeg':
            file_extension = 'jpg'

        filename = f"images/{timestamp}_{unique_id}.{file_extension}"

        # GCSクライアント作成
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(filename)

        # ファイルアップロード
        image_file.seek(0)
        blob.upload_from_file(
            image_file, content_type=f'image/{file_extension}')

        # GCSパスと公開URLを生成
        gcs_path = f"gs://{bucket_name}/{filename}"
        public_url = f"https://storage.googleapis.com/{bucket_name}/{filename}"

        print(f"📤 Image uploaded to GCS: {gcs_path}")
        print(f"🌏 Public URL: {public_url}")
        print(f"📁 Bucket: {bucket_name}")
        print(f"📄 Filename: {filename}")

        return {
            'success': True,
            'message': 'Image uploaded successfully',
            'gcs_path': gcs_path,
            'public_url': public_url,
            'bucket_name': bucket_name,
            'filename': filename
        }

    except Exception as e:
        return {
            'success': False,
            'message': f'Failed to upload image: {str(e)}',
            'gcs_path': '',
            'public_url': ''
        }


def analyze_image_from_gcs_path(gcs_path: str) -> Dict:
    """
    GCSパスからVision APIを使用してオブジェクト検出を行う

    Args:
        gcs_path: GCSパス (gs://bucket/path/to/image.jpg)

    Returns:
        {
            'success': bool,
            'message': str,
            'estimated_data': {
                'class': int,
                'confidence': float
            }
        }
    """
    try:
        from .models import ObjectLabel

        # Google Cloud認証情報が設定されているかチェック
        if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
            return {
                'success': False,
                'message': 'Google Cloud credentials not configured',
                'estimated_data': {}
            }

        # Vision APIクライアント作成
        client = vision.ImageAnnotatorClient()

        # GCSパスから画像を指定
        image = vision.Image()
        image.source.image_uri = gcs_path

        # オブジェクト検出実行
        response = client.object_localization(image=image)
        objects = response.localized_object_annotations

        if response.error.message:
            return {
                'success': False,
                'message': f'Vision API Error: {response.error.message}',
                'estimated_data': {}
            }

        if not objects:
            return {
                'success': False,
                'message': 'No objects detected',
                'estimated_data': {}
            }

        # スコアが最大のオブジェクトを取得
        top_object = max(objects, key=lambda obj: obj.score)
        object_name = top_object.name.lower()  # 小文字で統一
        confidence = top_object.score

        print(
            f"🔍 Top detected object: {object_name} (confidence: {confidence:.4f})")

        # ラベルマスタでオブジェクト名を検索・登録
        object_label, created = ObjectLabel.objects.get_or_create(
            name=object_name,
            defaults={'name': object_name}
        )

        if created:
            print(
                f"🆕 New label registered: {object_name} (ID: {object_label.id})")
        else:
            print(
                f"🔍 Existing label found: {object_name} (ID: {object_label.id})")

        return {
            'success': True,
            'message': 'success',
            'estimated_data': {
                'class': object_label.id,
                'confidence': round(confidence, 4)
            }
        }

    except Exception as e:
        return {
            'success': False,
            'message': f'Analysis failed: {str(e)}',
            'estimated_data': {}
        }
