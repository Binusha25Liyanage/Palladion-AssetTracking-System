from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PrinterViewSet, SystemSettingsView

router = DefaultRouter()
router.register("printers", PrinterViewSet, basename="printer")

urlpatterns = [
    path("settings", SystemSettingsView.as_view(), name="system-settings"),
] + router.urls
