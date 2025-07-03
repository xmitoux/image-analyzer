from django.contrib import admin

from .models import AiAnalysisLog


@admin.register(AiAnalysisLog)
class AiAnalysisLogAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'image_path', 'success', 'message', 'classification', 'confidence',
        'request_timestamp', 'response_timestamp', 'created_at'
    ]
    ordering = ['-created_at']
