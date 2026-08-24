from rest_framework.permissions import BasePermission, SAFE_METHODS


class AssetPermission(BasePermission):
    """
    Register / edit / retire an asset -> Admin only.
    Read (list/detail/by-tag) -> role-scoped queryset does the filtering,
    any authenticated user may issue the GET.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.is_admin
