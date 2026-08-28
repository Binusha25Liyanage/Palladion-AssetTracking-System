from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AssignmentViewSet

router = DefaultRouter(trailing_slash=False)
router.register("assignments", AssignmentViewSet, basename="assignment")

urlpatterns = router.urls
# NOTE: router doesn't natively support PATCH /assignments/:id/return since "return"
# is a reserved-ish word; the router auto-generates it via @action as
# /assignments/:id/return_asset/. If you want the exact /return path from the
# README, add an explicit path() here mapping to AssignmentViewSet.as_view(...).
