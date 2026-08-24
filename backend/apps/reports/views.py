import csv

from django.db.models import Count
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrDeptHead
from apps.assets.models import Asset


class BaseReportView(APIView):
    permission_classes = [IsAdminOrDeptHead]

    def scoped_assets(self, request):
        assets = Asset.objects.all()
        if request.user.is_dept_head:
            assets = assets.filter(department=request.user.department)
        return assets


class ReportByCategoryView(BaseReportView):
    def get(self, request):
        data = (
            self.scoped_assets(request)
            .values("category__name")
            .annotate(count=Count("id"))
            .order_by("category__name")
        )
        return Response(list(data))


class ReportByDepartmentView(BaseReportView):
    def get(self, request):
        data = (
            self.scoped_assets(request)
            .values("department__name")
            .annotate(count=Count("id"))
            .order_by("department__name")
        )
        return Response(list(data))


class ReportByStatusView(BaseReportView):
    def get(self, request):
        data = (
            self.scoped_assets(request)
            .values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        return Response(list(data))


class DepreciationSummaryReportView(APIView):
    """Admin-only, per the README."""

    from apps.accounts.permissions import IsAdmin

    permission_classes = [IsAdmin]

    def get(self, request):
        assets = Asset.objects.exclude(purchase_value=None)
        rows = [
            {
                "asset_tag": a.asset_tag,
                "name": a.name,
                "purchase_value": a.purchase_value,
                "book_value": a.book_value,
            }
            for a in assets
        ]
        return Response(rows)


class ReportExportView(BaseReportView):
    """
    GET /reports/export?type=csv|pdf — exports the current asset list.
    PDF export is stubbed for now (returns 501); wire up reportlab/WeasyPrint here.
    """

    def get(self, request):
        export_format = request.query_params.get("type", "csv")
        assets = self.scoped_assets(request)

        if export_format == "pdf":
            return Response({"detail": "PDF export not implemented yet."}, status=501)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="assets_report.csv"'
        writer = csv.writer(response)
        writer.writerow(["Asset Tag", "Name", "Category", "Status", "Department"])
        for asset in assets.select_related("category", "department"):
            writer.writerow(
                [asset.asset_tag, asset.name, asset.category.name, asset.status, getattr(asset.department, "name", "")]
            )
        return response
