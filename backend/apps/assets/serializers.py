from rest_framework import serializers

from .models import Asset, AssetCategory, AssetImage


class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = ["id", "name", "code"]


class AssetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetImage
        fields = ["id", "asset", "image_url", "image_type", "is_primary", "uploaded_at"]


class AssetListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default="")
    current_holder_name = serializers.CharField(source="current_holder.get_full_name", read_only=True, default="")

    class Meta:
        model = Asset
        fields = [
            "id", "asset_tag", "name", "category", "category_name", "status",
            "department", "department_name", "current_holder", "current_holder_name",
            "location", "created_at",
        ]


class AssetDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default="")
    current_holder_name = serializers.CharField(source="current_holder.get_full_name", read_only=True, default="")
    book_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    images = AssetImageSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id", "asset_tag", "name", "category", "category_name", "description",
            "serial_number", "status", "department", "department_name",
            "current_holder", "current_holder_name", "location",
            "purchase_date", "purchase_value", "useful_life_years", "book_value",
            "images", "created_at", "updated_at",
        ]
        read_only_fields = ["asset_tag"]
