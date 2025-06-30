from rest_framework import serializers

from .models import AiAnalysisLog


class AiAnalysisLogListSerializer(serializers.ModelSerializer):
    """AI分析ログ一覧用のシリアライザー"""

    processing_time_ms = serializers.SerializerMethodField()

    class Meta:
        model = AiAnalysisLog
        fields = [
            'id',
            'image_path',
            'success',
            'classification',
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
