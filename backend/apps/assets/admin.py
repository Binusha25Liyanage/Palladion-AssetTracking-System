from django.contrib import admin

from .models import Asset, AssetCategory, AssetImage


@admin.register(AssetCategory)
class AssetCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "code"]


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ["asset_tag", "name", "category", "status", "department", "current_holder"]
    list_filter = ["status", "category", "department"]
    search_fields = ["asset_tag", "name", "serial_number"]


@admin.register(AssetImage)
class AssetImageAdmin(admin.ModelAdmin):
    list_display = ["asset", "image_type", "is_primary", "uploaded_at"]
