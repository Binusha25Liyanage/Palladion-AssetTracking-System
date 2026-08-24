from rest_framework import viewsets

from apps.accounts.permissions import IsAdmin, IsAdminOrDeptHead

from .models import MaintenanceLog, MaintenanceSchedule
from .serializers import MaintenanceLogSerializer, MaintenanceScheduleSerializer


class MaintenanceLogViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceLogSerializer
    filterset_fields = ["status", "asset"]

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated

        if self.request.method == "POST":
            return [IsAuthenticated()]  # all roles may report an issue
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [IsAdminOrDeptHead()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceLog.objects.select_related("asset", "reported_by")
        if user.is_admin:
            return qs
        if user.is_dept_head:
            return qs.filter(asset__department=user.department)
        return qs.filter(reported_by=user)

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsAdminOrDeptHead]

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceSchedule.objects.select_related("asset")
        if user.is_admin:
            return qs
        return qs.filter(asset__department=user.department)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [IsAdminOrDeptHead()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
