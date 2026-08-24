from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords


class AssetCategory(models.Model):
    """IT Equipment / Vehicle / Machinery — drives the asset tag prefix."""

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=5, unique=True, help_text="Short code used in the asset tag, e.g. IT, VH, MC")

    class Meta:
        verbose_name_plural = "asset categories"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Asset(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        IN_REPAIR = "IN_REPAIR", "In Repair"
        RETIRED = "RETIRED", "Retired"
        DISPOSED = "DISPOSED", "Disposed"

    asset_tag = models.CharField(max_length=30, unique=True, editable=False)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(AssetCategory, on_delete=models.PROTECT, related_name="assets")
    description = models.TextField(blank=True)
    serial_number = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    department = models.ForeignKey(
        "accounts.Department", null=True, blank=True, on_delete=models.SET_NULL, related_name="assets"
    )
    current_holder = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="held_assets"
    )
    location = models.CharField(max_length=200, blank=True)

    purchase_date = models.DateField(null=True, blank=True)
    purchase_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    useful_life_years = models.PositiveIntegerField(default=5)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.asset_tag} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.asset_tag:
            self.asset_tag = self._generate_asset_tag()
        super().save(*args, **kwargs)

    def _generate_asset_tag(self):
        from django.conf import settings as dj_settings

        prefix = getattr(dj_settings, "ASSET_TAG_PREFIX", "LKM")
        last = (
            Asset.objects.filter(category=self.category)
            .order_by("-id")
            .values_list("asset_tag", flat=True)
            .first()
        )
        next_number = 1
        if last:
            try:
                next_number = int(last.rsplit("-", 1)[-1]) + 1
            except (ValueError, IndexError):
                next_number = Asset.objects.filter(category=self.category).count() + 1
        return f"{prefix}-{self.category.code}-{next_number:04d}"

    @property
    def book_value(self):
        """Straight-line depreciation: purchase_value reduced evenly over useful_life_years."""
        if not self.purchase_value or not self.purchase_date or not self.useful_life_years:
            return self.purchase_value
        from datetime import date

        years_elapsed = (date.today() - self.purchase_date).days / 365.25
        depreciation_per_year = self.purchase_value / self.useful_life_years
        depreciated = depreciation_per_year * min(years_elapsed, self.useful_life_years)
        value = self.purchase_value - depreciated
        return max(value, 0)


class AssetImage(models.Model):
    class ImageType(models.TextChoices):
        ASSET = "ASSET", "Asset photo"
        MAINTENANCE = "MAINTENANCE", "Maintenance / invoice photo"

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=500)
    image_type = models.CharField(max_length=20, choices=ImageType.choices, default=ImageType.ASSET)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"Image for {self.asset.asset_tag}"
