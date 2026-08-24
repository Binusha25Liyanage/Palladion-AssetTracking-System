from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords


class Assignment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        RETURNED = "RETURNED", "Returned"

    asset = models.ForeignKey("assets.Asset", on_delete=models.CASCADE, related_name="assignments")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assignments_received"
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="assignments_made"
    )
    department = models.ForeignKey(
        "accounts.Department", null=True, blank=True, on_delete=models.SET_NULL, related_name="assignments"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)

    assigned_at = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(null=True, blank=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.asset.asset_tag} -> {self.assigned_to} ({self.status})"
