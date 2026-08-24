from django.urls import path

from .views import (
    DepreciationSummaryReportView,
    ReportByCategoryView,
    ReportByDepartmentView,
    ReportByStatusView,
    ReportExportView,
)

urlpatterns = [
    path("reports/by-category", ReportByCategoryView.as_view(), name="report-by-category"),
    path("reports/by-department", ReportByDepartmentView.as_view(), name="report-by-department"),
    path("reports/by-status", ReportByStatusView.as_view(), name="report-by-status"),
    path("reports/depreciation-summary", DepreciationSummaryReportView.as_view(), name="report-depreciation-summary"),
    path("reports/export", ReportExportView.as_view(), name="report-export"),
]
