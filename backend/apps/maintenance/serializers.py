from rest_framework import serializers

from .models import MaintenanceLog, MaintenanceSchedule


class MaintenanceLogSerializer(serializers.ModelSerializer):
    asset_tag = serializers.CharField(source="asset.asset_tag", read_only=True)
    reported_by_name = serializers.CharField(source="reported_by.get_full_name", read_only=True)

    class Meta:
        model = MaintenanceLog
        fields = [
            "id", "asset", "asset_tag", "reported_by", "reported_by_name",
            "issue_description", "status", "resolution_notes", "invoice_image_url",
            "reported_at", "resolved_at",
        ]
        read_only_fields = ["reported_by", "reported_at"]


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    asset_tag = serializers.CharField(source="asset.asset_tag", read_only=True)

    class Meta:
        model = MaintenanceSchedule
        fields = ["id", "asset", "asset_tag", "description", "frequency_days", "next_due_date", "created_by"]
        read_only_fields = ["created_by"]
