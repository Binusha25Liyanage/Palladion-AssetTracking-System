"""
Shared DRF permission classes used across the whole API.

Roles: ADMIN > DEPT_HEAD > EMPLOYEE (see apps.accounts.models.User.Role)
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsAdminOrDeptHead(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin or request.user.is_dept_head)
        )


class IsAdminOrReadOnlyForDeptHead(BasePermission):
    """Admin can write; Dept Head can only read; Employee has no access."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_admin:
            return True
        if user.is_dept_head:
            return request.method in SAFE_METHODS
        return False


class IsAuthenticatedAnyRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
