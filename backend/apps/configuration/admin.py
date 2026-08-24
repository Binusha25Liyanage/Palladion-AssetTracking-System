from django.contrib import admin

from .models import Printer, SystemSettings


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ["company_name", "audit_log_enabled", "updated_at"]


@admin.register(Printer)
class PrinterAdmin(admin.ModelAdmin):
    list_display = ["name", "printer_type", "is_default"]
