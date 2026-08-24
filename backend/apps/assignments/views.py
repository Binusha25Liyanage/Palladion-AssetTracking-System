from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrDeptHead
from apps.assets.models import Asset

from .models import Assignment
from .serializers import AssignmentSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAdminOrDeptHead]
    filterset_fields = ["status", "department", "asset"]

    def get_queryset(self):
        user = self.request.user
        qs = Assignment.objects.select_related("asset", "assigned_to", "department")
        if user.is_admin:
            return qs
        return qs.filter(department=user.department)

    def perform_create(self, serializer):
        assignment = serializer.save(assigned_by=self.request.user)
        asset = assignment.asset
        asset.current_holder = assignment.assigned_to
        asset.department = assignment.department or asset.department
        asset.save(update_fields=["current_holder", "department"])

    @action(detail=True, methods=["patch"])
    def return_asset(self, request, pk=None):
        """PATCH /assignments/:id/return"""
        from django.utils import timezone

        assignment = self.get_object()
        assignment.status = Assignment.Status.RETURNED
        assignment.returned_at = timezone.now()
        assignment.save(update_fields=["status", "returned_at"])

        asset = assignment.asset
        asset.current_holder = None
        asset.save(update_fields=["current_holder"])
        return Response(AssignmentSerializer(assignment).data)
