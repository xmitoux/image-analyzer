from django.contrib import admin

from .models import AiAnalysisLog


@admin.register(AiAnalysisLog)
class AiAnalysisLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'image_path', 'success',
                    'classification', 'confidence', 'created_at']
    list_filter = ['success', 'classification', 'created_at']
    search_fields = ['image_path', 'message']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
