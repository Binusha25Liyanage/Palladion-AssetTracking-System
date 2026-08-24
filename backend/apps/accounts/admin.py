from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Department, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ["email", "username", "first_name", "last_name", "role", "department", "is_active"]
    list_filter = ["role", "department", "is_active"]
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("AssetTrack", {"fields": ("role", "department", "phone", "is_active_employee")}),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "head", "created_at"]
