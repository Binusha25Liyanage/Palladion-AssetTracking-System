from django.urls import path

from .views import AssetDepreciationView, AssetValuationListCreateView

urlpatterns = [
    path("assets/<int:asset_id>/valuations", AssetValuationListCreateView.as_view(), name="asset-valuations"),
    path("assets/<int:asset_id>/depreciation", AssetDepreciationView.as_view(), name="asset-depreciation"),
]
