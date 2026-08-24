from django.contrib import admin

from .models import MaintenanceLog, MaintenanceSchedule


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ["asset", "status", "reported_by", "reported_at", "resolved_at"]
    list_filter = ["status"]


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ["asset", "description", "frequency_days", "next_due_date"]
