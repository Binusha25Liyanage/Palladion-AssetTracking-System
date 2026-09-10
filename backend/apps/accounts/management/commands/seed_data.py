from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.assets.models import AssetCategory
from apps.organizations.models import Organization

CATEGORY_DEFAULTS = [
    ("IT Equipment", "IT"),
    ("Vehicle", "VH"),
    ("Machinery", "MC"),
]

ORG_DEFAULTS = [
    {
        "name": "PALLADION",
        "slug": "palladion",
        "tag_prefix": "PLD",
        "primary_color": "#A02334",  # Cherry Alloy Red
        "logo_filename": "logo-palladion.png",
        "admin_email": "admin@palladion.local",
    },
    {
        "name": "Lakmee Holdings",
        "slug": "lakmee-holdings",
        "tag_prefix": "LKM",
        "primary_color": "#D52126",  # sampled from the Lakmee Holdings ID card
        "logo_filename": "logo-lakmee.png",
        "admin_email": "admin@lakmeeholdings.local",
    },
]


class Command(BaseCommand):
    help = "Create both organizations, one default Admin per organization, and default asset categories."

    def handle(self, *args, **options):
        for org_def in ORG_DEFAULTS:
            org, created = Organization.objects.get_or_create(
                slug=org_def["slug"],
                defaults={
                    "name": org_def["name"],
                    "tag_prefix": org_def["tag_prefix"],
                    "primary_color": org_def["primary_color"],
                    "logo_filename": org_def["logo_filename"],
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created organization: {org.name}"))
            else:
                self.stdout.write(f"Organization already exists, skipping: {org.name}")

            if not User.objects.filter(email=org_def["admin_email"]).exists():
                User.objects.create_superuser(
                    username=f"admin-{org.slug}",
                    email=org_def["admin_email"],
                    password="Admin@1234",
                    first_name="System",
                    last_name="Admin",
                    role=User.Role.ADMIN,
                    organization=org,
                )
                self.stdout.write(
                    self.style.SUCCESS(f"Created default admin for {org.name}: {org_def['admin_email']} / Admin@1234")
                )
            else:
                self.stdout.write(f"Admin user already exists, skipping: {org_def['admin_email']}")

            for name, code in CATEGORY_DEFAULTS:
                _, created = AssetCategory.objects.get_or_create(
                    organization=org, code=code, defaults={"name": name}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"[{org.name}] Created category: {name} ({code})"))

        self.stdout.write(self.style.SUCCESS("Seed complete."))
