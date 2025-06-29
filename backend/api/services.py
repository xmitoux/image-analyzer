"""
Google Cloud Vision API サービス
"""
import base64
import io
from typing import Dict, List, Optional, Union

from django.conf import settings
from google.cloud import vision


class VisionAPIService:
    """Google Cloud Vision API を使用した画像解析サービス"""

    def __init__(self):
        self.client = vision.ImageAnnotatorClient()

    @staticmethod
    def run_quickstart() -> Dict:
        """Provides a quick start example for Cloud Vision."""
        try:
            # Instantiates a client
            client = vision.ImageAnnotatorClient()

            # The URI of the image file to annotate
            file_uri = "gs://cloud-samples-data/vision/label/wakeupcat.jpg"

            image = vision.Image()
            image.source.image_uri = file_uri

            # Performs label detection on the image file
            response = client.label_detection(image=image)
            labels = response.label_annotations

            if response.error.message:
                return {
                    'success': False,
                    'error': f'Vision API Error: {response.error.message}'
                }

            result_labels = []
            print("Labels:")
            for label in labels:
                print(f"- {label.description} (confidence: {label.score:.2f})")
                result_labels.append({
                    'description': label.description,
                    'score': label.score
                })

            return {
                'success': True,
                'labels': result_labels,
                'message': f'Found {len(result_labels)} labels'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def analyze_image(self, image_content: Union[bytes, str],
                      analysis_types: Optional[List[str]] = None) -> Dict:
        """
        画像を解析する

        Args:
            image_content: 画像のバイナリデータまたはbase64文字列
            analysis_types: 実行する解析のタイプリスト
                          ['labels', 'text', 'faces', 'objects', 'landmarks']

        Returns:
            解析結果の辞書
        """
        if analysis_types is None:
            analysis_types = ['labels', 'text']

        try:
            # 画像データの準備
            if isinstance(image_content, str):
                # base64文字列の場合、data URLプレフィックスを除去
                if image_content.startswith('data:image/'):
                    # data:image/jpeg;base64,... 形式の場合
                    image_content = image_content.split(',', 1)[1]

                try:
                    image_content = base64.b64decode(image_content)
                except Exception as decode_error:
                    raise Exception(
                        f"Invalid base64 data: {str(decode_error)}")

            # 画像データのサイズチェック
            if len(image_content) == 0:
                raise Exception("Empty image data")

            if len(image_content) > 20 * 1024 * 1024:  # 20MB制限
                raise Exception("Image data too large (max 20MB)")

            image = vision.Image(content=image_content)

            results = {}

            # ラベル検出
            if 'labels' in analysis_types:
                results['labels'] = self._detect_labels(image)

            # テキスト検出
            if 'text' in analysis_types:
                results['text'] = self._detect_text(image)

            # 顔検出
            if 'faces' in analysis_types:
                results['faces'] = self._detect_faces(image)

            # オブジェクト検出
            if 'objects' in analysis_types:
                results['objects'] = self._detect_objects(image)

            # ランドマーク検出
            if 'landmarks' in analysis_types:
                results['landmarks'] = self._detect_landmarks(image)

            return {
                'success': True,
                'results': results
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def _detect_labels(self, image: vision.Image) -> List[Dict]:
        """ラベル検出"""
        response = self.client.label_detection(image=image)
        labels = response.label_annotations

        if response.error.message:
            raise Exception(f'{response.error.message}')

        return [{
            'description': label.description,
            'score': label.score,
            'confidence': label.score
        } for label in labels]

    def _detect_text(self, image: vision.Image) -> Dict:
        """テキスト検出"""
        response = self.client.text_detection(image=image)
        texts = response.text_annotations

        if response.error.message:
            raise Exception(f'{response.error.message}')

        if texts:
            # 最初の要素は全体のテキスト
            full_text = texts[0].description
            # 残りは個別の文字/単語
            words = [{
                'text': text.description,
                'bounds': {
                    'vertices': [
                        {'x': vertex.x, 'y': vertex.y}
                        for vertex in text.bounding_poly.vertices
                    ]
                }
            } for text in texts[1:]]

            return {
                'full_text': full_text,
                'words': words
            }

        return {'full_text': '', 'words': []}

    def _detect_faces(self, image: vision.Image) -> List[Dict]:
        """顔検出"""
        response = self.client.face_detection(image=image)
        faces = response.face_annotations

        if response.error.message:
            raise Exception(f'{response.error.message}')

        return [{
            'confidence': face.detection_confidence,
            'joy_likelihood': face.joy_likelihood.name,
            'sorrow_likelihood': face.sorrow_likelihood.name,
            'anger_likelihood': face.anger_likelihood.name,
            'surprise_likelihood': face.surprise_likelihood.name,
            'bounds': {
                'vertices': [
                    {'x': vertex.x, 'y': vertex.y}
                    for vertex in face.bounding_poly.vertices
                ]
            }
        } for face in faces]

    def _detect_objects(self, image: vision.Image) -> List[Dict]:
        """オブジェクト検出"""
        response = self.client.object_localization(image=image)
        objects = response.localized_object_annotations

        if response.error.message:
            raise Exception(f'{response.error.message}')

        return [{
            'name': obj.name,
            'score': obj.score,
            'bounds': {
                'vertices': [
                    {'x': vertex.x, 'y': vertex.y}
                    for vertex in obj.bounding_poly.normalized_vertices
                ]
            }
        } for obj in objects]

    def _detect_landmarks(self, image: vision.Image) -> List[Dict]:
        """ランドマーク検出"""
        response = self.client.landmark_detection(image=image)
        landmarks = response.landmark_annotations

        if response.error.message:
            raise Exception(f'{response.error.message}')

        return [{
            'description': landmark.description,
            'score': landmark.score,
            'locations': [{
                'latitude': location.lat_lng.latitude,
                'longitude': location.lat_lng.longitude
            } for location in landmark.locations]
        } for landmark in landmarks]


def analyze_image_with_vision_api(image_content: Union[bytes, str],
                                  analysis_types: Optional[List[str]] = None) -> Dict:
    """
    Vision APIを使用して画像を解析する便利関数

    Args:
        image_content: 画像のバイナリデータまたはbase64文字列
        analysis_types: 実行する解析のタイプリスト

    Returns:
        解析結果の辞書
    """
    service = VisionAPIService()
    return service.analyze_image(image_content, analysis_types)
