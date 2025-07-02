from rest_framework import serializers

from .models import AiAnalysisLog, ObjectLabel


class AiAnalysisLogListSerializer(serializers.ModelSerializer):
    """AI分析ログ一覧用のシリアライザー"""

    processing_time_ms = serializers.SerializerMethodField()
    classification_name = serializers.SerializerMethodField()

    class Meta:
        model = AiAnalysisLog
        fields = [
            'id',
            'image_path',
            'success',
            'classification',
            'classification_name',
            'confidence',
            'processing_time_ms',
            'created_at'
        ]

    def get_processing_time_ms(self, obj):
        """処理時間を計算してミリ秒で返す"""
        if obj.request_timestamp and obj.response_timestamp:
            delta = obj.response_timestamp - obj.request_timestamp
            return int(delta.total_seconds() * 1000)
        return None

    def get_classification_name(self, obj):
        """分類名を取得"""
        if obj.classification:
            try:
                label = ObjectLabel.objects.get(id=obj.classification)
                return label.name
            except ObjectLabel.DoesNotExist:
                return f"ラベル ID: {obj.classification}"
        return None
