from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Asset, AssetCategory, AssetImage
from .permissions import AssetPermission
from .serializers import (
    AssetCategorySerializer,
    AssetDetailSerializer,
    AssetImageSerializer,
    AssetListSerializer,
)


class AssetCategoryViewSet(viewsets.ModelViewSet):
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            from rest_framework.permissions import IsAuthenticated

            return [IsAuthenticated()]
        from apps.accounts.permissions import IsAdmin

        return [IsAdmin()]


class AssetViewSet(viewsets.ModelViewSet):
    permission_classes = [AssetPermission]
    search_fields = ["asset_tag", "name", "serial_number"]
    filterset_fields = ["status", "category", "department"]

    def get_serializer_class(self):
        if self.action == "list":
            return AssetListSerializer
        return AssetDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Asset.objects.select_related("category", "department", "current_holder")
        if user.is_admin:
            return qs
        if user.is_dept_head:
            return qs.filter(department=user.department)
        # Employee: only assets currently assigned to them
        return qs.filter(current_holder=user)

    @action(detail=False, methods=["get"], url_path="by-tag/(?P<tag>[^/.]+)")
    def by_tag(self, request, tag=None):
        asset = self.get_queryset().filter(asset_tag=tag).first()
        if not asset:
            return Response({"detail": "Asset not found."}, status=404)
        return Response(AssetDetailSerializer(asset).data)

    @action(detail=True, methods=["patch"], url_path="status")
    def set_status(self, request, pk=None):
        asset = self.get_object()
        new_status = request.data.get("status")
        if new_status not in Asset.Status.values:
            return Response({"detail": "Invalid status."}, status=400)
        asset.status = new_status
        asset.save(update_fields=["status"])
        return Response(AssetDetailSerializer(asset).data)

    @action(detail=True, methods=["post"])
    def retire(self, request, pk=None):
        asset = self.get_object()
        asset.status = Asset.Status.RETIRED
        asset.current_holder = None
        asset.save(update_fields=["status", "current_holder"])
        return Response(AssetDetailSerializer(asset).data)


class AssetImageViewSet(viewsets.ModelViewSet):
    """
    Minimal stand-in for the presigned-upload-URL flow described in the README
    (POST /assets/:id/images/upload-url + POST /assets/:id/images). For now this
    just stores an already-uploaded image URL; wire up R2 presigned URLs here
    once credentials are configured (see settings.R2_*).
    """

    queryset = AssetImage.objects.all()
    serializer_class = AssetImageSerializer

    def get_permissions(self):
        from apps.accounts.permissions import IsAdminOrDeptHead

        return [IsAdminOrDeptHead()]

    @action(detail=True, methods=["patch"], url_path="set-primary")
    def set_primary(self, request, pk=None):
        image = self.get_object()
        AssetImage.objects.filter(asset=image.asset).update(is_primary=False)
        image.is_primary = True
        image.save(update_fields=["is_primary"])
        return Response(AssetImageSerializer(image).data)
