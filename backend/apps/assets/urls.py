from rest_framework.routers import DefaultRouter

from .views import AssetCategoryViewSet, AssetImageViewSet, AssetViewSet

router = DefaultRouter()
router.register("categories", AssetCategoryViewSet, basename="category")
router.register("assets", AssetViewSet, basename="asset")
router.register("asset-images", AssetImageViewSet, basename="asset-image")

urlpatterns = router.urls
