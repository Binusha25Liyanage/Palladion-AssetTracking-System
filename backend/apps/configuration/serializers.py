from rest_framework import serializers

from .models import Printer, SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ["id", "audit_log_enabled", "company_name", "updated_at"]


class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Printer
        fields = ["id", "name", "printer_type", "connection_info", "is_default"]
