from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin

from .models import Printer, SystemSettings
from .serializers import PrinterSerializer, SystemSettingsSerializer


class SystemSettingsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(SystemSettingsSerializer(SystemSettings.load(request.user.organization)).data)

    def patch(self, request):
        settings_obj = SystemSettings.load(request.user.organization)
        serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PrinterViewSet(viewsets.ModelViewSet):
    serializer_class = PrinterSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Printer.objects.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)
