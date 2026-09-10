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

    def validate(self, attrs):
        user = self.context["request"].user
        asset = attrs.get("asset")
        assigned_to = attrs.get("assigned_to")
        if asset and asset.organization_id != user.organization_id:
            raise serializers.ValidationError("That asset doesn't belong to your organization.")
        if assigned_to and assigned_to.organization_id != user.organization_id:
            raise serializers.ValidationError("That employee doesn't belong to your organization.")
        return attrs
