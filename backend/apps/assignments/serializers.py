from rest_framework import serializers

from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):
    asset_tag = serializers.CharField(source="asset.asset_tag", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "asset", "asset_tag", "assigned_to", "assigned_to_name",
            "assigned_by", "department", "status", "notes",
            "assigned_at", "returned_at",
        ]
        read_only_fields = ["assigned_by", "status", "returned_at", "assigned_at"]
