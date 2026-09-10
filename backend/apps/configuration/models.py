from django.db import models


class SystemSettings(models.Model):
    """One row per organization, holding that org's system-wide toggles."""

    organization = models.OneToOneField(
        "organizations.Organization", on_delete=models.CASCADE, related_name="settings"
    )
    audit_log_enabled = models.BooleanField(default=True)
    company_name = models.CharField(max_length=200, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "system settings"

    def __str__(self):
        return f"System Settings ({self.organization.name})"

    @classmethod
    def load(cls, organization):
        obj, created = cls.objects.get_or_create(
            organization=organization, defaults={"company_name": organization.name}
        )
        return obj


class Printer(models.Model):
    class PrinterType(models.TextChoices):
        A4 = "A4", "A4"
        THERMAL = "THERMAL", "Thermal"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.PROTECT, related_name="printers"
    )
    name = models.CharField(max_length=100)
    printer_type = models.CharField(max_length=20, choices=PrinterType.choices, default=PrinterType.A4)
    connection_info = models.CharField(max_length=255, blank=True, help_text="Printer name/IP as seen by the OS")
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.printer_type})"
