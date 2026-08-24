from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAuthenticatedAnyRole
from apps.assets.models import Asset
from apps.maintenance.models import MaintenanceSchedule


class DashboardSummaryView(APIView):
    """GET /dashboard/summary — role-aware overview stats."""

    permission_classes = [IsAuthenticatedAnyRole]

    def get(self, request):
        user = request.user
        assets = Asset.objects.all()
        schedules = MaintenanceSchedule.objects.all()

        if user.is_dept_head:
            assets = assets.filter(department=user.department)
            schedules = schedules.filter(asset__department=user.department)
        elif user.is_employee:
            assets = assets.filter(current_holder=user)
            schedules = schedules.filter(asset__current_holder=user)

        status_breakdown = {
            choice_value: assets.filter(status=choice_value).count()
            for choice_value, _ in Asset.Status.choices
        }

        upcoming_maintenance = schedules.filter(next_due_date__gte=timezone.now().date()).order_by("next_due_date")[:5]

        return Response(
            {
                "total_assets": assets.count(),
                "status_breakdown": status_breakdown,
                "upcoming_maintenance_count": upcoming_maintenance.count(),
                "upcoming_maintenance": [
                    {"asset_tag": s.asset.asset_tag, "description": s.description, "due": s.next_due_date}
                    for s in upcoming_maintenance
                ],
            }
        )
