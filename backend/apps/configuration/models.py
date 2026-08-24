from django.db import models


class SystemSettings(models.Model):
    """Singleton row holding system-wide toggles."""

    audit_log_enabled = models.BooleanField(default=True)
    company_name = models.CharField(max_length=200, default="Lakmee Exports Lanka (Pvt) Ltd")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "system settings"

    def __str__(self):
        return "System Settings"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Printer(models.Model):
    class PrinterType(models.TextChoices):
        A4 = "A4", "A4"
        THERMAL = "THERMAL", "Thermal"

    name = models.CharField(max_length=100)
    printer_type = models.CharField(max_length=20, choices=PrinterType.choices, default=PrinterType.A4)
    connection_info = models.CharField(max_length=255, blank=True, help_text="Printer name/IP as seen by the OS")
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.printer_type})"
