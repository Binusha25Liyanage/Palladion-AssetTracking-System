from django.conf import settings
from django.db import models


class MaintenanceLog(models.Model):
    class Status(models.TextChoices):
        REPORTED = "REPORTED", "Reported"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        RESOLVED = "RESOLVED", "Resolved"

    asset = models.ForeignKey("assets.Asset", on_delete=models.CASCADE, related_name="maintenance_logs")
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reported_issues")
    issue_description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REPORTED)
    resolution_notes = models.TextField(blank=True)
    invoice_image_url = models.URLField(max_length=500, blank=True)

    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-reported_at"]

    def __str__(self):
        return f"{self.asset.asset_tag} — {self.status}"


class MaintenanceSchedule(models.Model):
    asset = models.ForeignKey("assets.Asset", on_delete=models.CASCADE, related_name="maintenance_schedules")
    description = models.CharField(max_length=200)
    frequency_days = models.PositiveIntegerField(help_text="Recurring interval in days")
    next_due_date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ["next_due_date"]

    def __str__(self):
        return f"{self.asset.asset_tag} due {self.next_due_date}"
