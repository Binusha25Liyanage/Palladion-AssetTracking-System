from rest_framework import serializers

from .models import MarketValuation


class MarketValuationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketValuation
        fields = ["id", "asset", "value", "estimated_by", "estimated_at", "notes"]
        read_only_fields = ["estimated_by", "estimated_at"]
