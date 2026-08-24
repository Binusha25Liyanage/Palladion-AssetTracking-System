from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["timestamp", "user", "action", "model_name", "object_id"]
    list_filter = ["action", "model_name"]
