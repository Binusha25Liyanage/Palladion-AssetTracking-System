from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import ChangePasswordSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login {email, password, organization: <slug>} -> {access, refresh, user}

    The `organization` slug is required and checked against the account's
    actual organization *before* credentials are validated — logging in as a
    real PALLADION user while the "Lakmee Holdings" organization is selected
    is rejected here, not left to queryset filtering to quietly hide later.
    """

    def post(self, request, *args, **kwargs):
        org_slug = request.data.get("organization")
        if not org_slug:
            return Response({"detail": "Please select an organization."}, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get("email") or request.data.get("username")
        from .models import User

        user = User.objects.filter(email=email).select_related("organization").first()
        if user and user.organization.slug != org_slug:
            return Response(
                {"detail": "This account doesn't belong to the selected organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and user:
            response.data["user"] = UserSerializer(user).data
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"detail": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated."})
