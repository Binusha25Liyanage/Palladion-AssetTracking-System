from rest_framework.routers import DefaultRouter

from .views import MaintenanceLogViewSet, MaintenanceScheduleViewSet

router = DefaultRouter(trailing_slash=False)
router.register("maintenance-logs", MaintenanceLogViewSet, basename="maintenance-log")
router.register("maintenance-schedules", MaintenanceScheduleViewSet, basename="maintenance-schedule")

urlpatterns = router.urls
