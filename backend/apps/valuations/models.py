from django.conf import settings
from django.db import models


class MarketValuation(models.Model):
    asset = models.ForeignKey("assets.Asset", on_delete=models.CASCADE, related_name="valuations")
    value = models.DecimalField(max_digits=12, decimal_places=2)
    estimated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    estimated_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-estimated_at"]

    def __str__(self):
        return f"{self.asset.asset_tag} valued at {self.value} on {self.estimated_at:%Y-%m-%d}"
