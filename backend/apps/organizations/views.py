from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Organization
from .serializers import OrganizationSerializer


class OrganizationViewSet(ReadOnlyModelViewSet):
    """
    Public read-only list — the Login screen needs to show the organization
    picker (with its name/color/logo) *before* anyone is authenticated.
    """

    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]
    pagination_class = None
