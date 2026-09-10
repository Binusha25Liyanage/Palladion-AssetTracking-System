from django.db import models


class Organization(models.Model):
    """
    A tenant. Every business-data model (User, Asset, Assignment, etc.) belongs
    to exactly one Organization, and the API scopes every query to the
    logged-in user's organization — two organizations never see each other's
    data. Seeded with exactly two rows: PALLADION and Lakmee Holdings
    (see apps.accounts.management.commands.seed_data).
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    tag_prefix = models.CharField(
        max_length=10, help_text="Prefix used in this org's asset tags, e.g. 'PLD' -> PLD-IT-0001"
    )
    primary_color = models.CharField(max_length=7, default="#A02334", help_text="Hex color, e.g. #A02334")
    logo_filename = models.CharField(
        max_length=100, blank=True, help_text="Filename under frontend/public/, e.g. 'logo-palladion.png'"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
