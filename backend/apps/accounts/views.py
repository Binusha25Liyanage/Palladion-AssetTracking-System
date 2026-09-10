from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Department, User
from .permissions import IsAdmin
from .serializers import DepartmentSerializer, UserCreateSerializer, UserSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    search_fields = ["name"]

    def get_permissions(self):
        if self.request.method == "GET":
            from .permissions import IsAuthenticatedAnyRole

            return [IsAuthenticatedAnyRole()]
        return [IsAdmin()]

    def get_queryset(self):
        return Department.objects.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class UserViewSet(viewsets.ModelViewSet):
    """Admin-only user management, scoped to the admin's own organization.
    GET /users, POST /users, PATCH /users/:id, etc."""

    permission_classes = [IsAdmin]
    search_fields = ["first_name", "last_name", "email", "username"]
    filterset_fields = ["role", "department", "is_active_employee"]

    def get_queryset(self):
        return User.objects.filter(organization=self.request.user.organization).order_by("first_name")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=["patch"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.is_active_employee = False
        user.save(update_fields=["is_active", "is_active_employee"])
        return Response(UserSerializer(user).data)
