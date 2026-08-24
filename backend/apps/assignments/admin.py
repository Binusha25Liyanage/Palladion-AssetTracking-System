from django.contrib import admin

from .models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["asset", "assigned_to", "department", "status", "assigned_at", "returned_at"]
    list_filter = ["status", "department"]
