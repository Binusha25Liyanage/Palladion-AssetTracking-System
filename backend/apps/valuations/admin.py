from django.contrib import admin

from .models import MarketValuation


@admin.register(MarketValuation)
class MarketValuationAdmin(admin.ModelAdmin):
    list_display = ["asset", "value", "estimated_by", "estimated_at"]
