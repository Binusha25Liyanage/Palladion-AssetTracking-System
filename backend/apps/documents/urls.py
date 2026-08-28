
from django.urls import path

from . import views

urlpatterns = [
    path("assets/<int:asset_id>/qr-code", views.AssetQrCodeView.as_view(), name="asset-qr-code"),
    path("assets/<int:asset_id>/label-pdf", views.AssetLabelPdfView.as_view(), name="asset-label-pdf"),
    path("assets/bulk-labels", views.BulkLabelPdfView.as_view(), name="bulk-labels"),
    path("assignments/<int:assignment_id>/dispatch-note", views.DispatchNoteView.as_view(), name="dispatch-note"),
    path("assignments/<int:assignment_id>/agreement", views.AgreementView.as_view(), name="agreement"),
    path("assignments/<int:assignment_id>/return-note", views.ReturnNoteView.as_view(), name="return-note"),
    path("maintenance-logs/<int:log_id>/report", views.MaintenanceReportView.as_view(), name="maintenance-report"),
]
