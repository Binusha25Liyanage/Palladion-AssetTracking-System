from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import ChangePasswordView, LoginView, MeView

urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("refresh", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me", MeView.as_view(), name="auth-me"),
    path("change-password", ChangePasswordView.as_view(), name="auth-change-password"),
]
