from rest_framework.routers import DefaultRouter

from .views import MaintenanceLogViewSet, MaintenanceScheduleViewSet

router = DefaultRouter()
router.register("maintenance-logs", MaintenanceLogViewSet, basename="maintenance-log")
router.register("maintenance-schedules", MaintenanceScheduleViewSet, basename="maintenance-schedule")

urlpatterns = router.urls
