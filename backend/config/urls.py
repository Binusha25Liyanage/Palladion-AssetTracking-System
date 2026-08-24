from django.contrib import admin
from django.urls import include, path

api_v1_patterns = [
    path("auth/", include("apps.accounts.auth_urls")),
    path("", include("apps.accounts.urls")),          # /users, /departments
    path("", include("apps.assets.urls")),             # /categories, /assets
    path("", include("apps.assignments.urls")),        # /assignments
    path("", include("apps.maintenance.urls")),        # /maintenance-logs, /maintenance-schedules
    path("", include("apps.valuations.urls")),         # /assets/:id/valuations, /depreciation
    path("", include("apps.configuration.urls")),      # /settings, /printers
    path("", include("apps.audit.urls")),               # /audit-logs
    path("", include("apps.dashboard.urls")),          # /dashboard/summary
    path("", include("apps.reports.urls")),            # /reports/*
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
]
