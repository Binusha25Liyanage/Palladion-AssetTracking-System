from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin
from apps.assets.models import Asset
from apps.assignments.models import Assignment
from apps.maintenance.models import MaintenanceLog

from . import utils


class AssetQrCodeView(APIView):
    """GET /assets/:id/qr-code -> PNG image of a QR code encoding the asset tag."""

    permission_classes = [IsAuthenticated]

    def get(self, request, asset_id):
        asset = Asset.objects.filter(pk=asset_id).first()
        if not asset:
            return HttpResponse("Asset not found.", status=404)
        buf = utils.generate_qr_image(asset.asset_tag)
        return HttpResponse(buf.getvalue(), content_type="image/png")


class AssetLabelPdfView(APIView):
    """GET /assets/:id/label-pdf?type=A4|THERMAL -> single-asset label PDF."""

    permission_classes = [IsAuthenticated]

    def get(self, request, asset_id):
        asset = Asset.objects.filter(pk=asset_id).first()
        if not asset:
            return HttpResponse("Asset not found.", status=404)
        label_type = request.query_params.get("type", "A4").upper()
        pdf_bytes = utils.build_label_pdf([asset], label_type=label_type)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{asset.asset_tag}-label.pdf"'
        return response


class BulkLabelPdfView(APIView):
    """POST /assets/bulk-labels {asset_ids: [...], type: A4|THERMAL} -> combined label sheet PDF."""

    permission_classes = [IsAdmin]

    def post(self, request):
        asset_ids = request.data.get("asset_ids", [])
        label_type = request.data.get("type", "A4").upper()
        assets = list(Asset.objects.filter(pk__in=asset_ids))
        if not assets:
            return HttpResponse("No assets selected.", status=400)
        pdf_bytes = utils.build_label_pdf(assets, label_type=label_type)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="bulk-asset-labels.pdf"'
        return response


class DispatchNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = Assignment.objects.select_related("asset", "assigned_to", "assigned_by", "department").filter(
            pk=assignment_id
        ).first()
        if not assignment:
            return HttpResponse("Assignment not found.", status=404)
        pdf_bytes = utils.build_dispatch_note_pdf(assignment)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="dispatch-note-{assignment.asset.asset_tag}.pdf"'
        return response


class AgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = Assignment.objects.select_related("asset", "assigned_to").filter(pk=assignment_id).first()
        if not assignment:
            return HttpResponse("Assignment not found.", status=404)
        pdf_bytes = utils.build_agreement_pdf(assignment)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="agreement-{assignment.asset.asset_tag}.pdf"'
        return response


class ReturnNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = Assignment.objects.select_related("asset", "assigned_to").filter(pk=assignment_id).first()
        if not assignment or assignment.status != Assignment.Status.RETURNED:
            return HttpResponse("This asset has not been returned yet.", status=400)
        pdf_bytes = utils.build_return_note_pdf(assignment)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="return-note-{assignment.asset.asset_tag}.pdf"'
        return response


class MaintenanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, log_id):
        log = MaintenanceLog.objects.select_related("asset", "reported_by").filter(pk=log_id).first()
        if not log:
            return HttpResponse("Maintenance log not found.", status=404)
        pdf_bytes = utils.build_maintenance_report_pdf(log)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="maintenance-report-{log.asset.asset_tag}-{log.id}.pdf"'
        )
        return response
