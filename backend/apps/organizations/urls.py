from rest_framework.routers import DefaultRouter

from .views import OrganizationViewSet

router = DefaultRouter(trailing_slash=False)
router.register("organizations", OrganizationViewSet, basename="organization")

urlpatterns = router.urls
