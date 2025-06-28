from django.db import models


class AiAnalysisLog(models.Model):
    image_path = models.CharField(max_length=255, null=True, blank=True)
    success = models.BooleanField()
    message = models.CharField(max_length=255, null=True, blank=True)
    classification = models.IntegerField(null=True, blank=True)
    confidence = models.DecimalField(
        max_digits=5, decimal_places=4, null=True, blank=True
    )
    request_timestamp = models.DateTimeField(null=True, blank=True)
    response_timestamp = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_analysis_log'  # テーブル名指定

    def __str__(self):
        return f"AI Analysis {self.id}: {self.image_path}"
