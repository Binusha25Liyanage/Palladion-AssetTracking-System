from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet, UserViewSet

router = DefaultRouter(trailing_slash=False)
router.register("departments", DepartmentViewSet, basename="department")
router.register("users", UserViewSet, basename="user")

urlpatterns = router.urls
