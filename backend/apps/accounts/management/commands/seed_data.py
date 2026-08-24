from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.assets.models import AssetCategory


class Command(BaseCommand):
    help = "Create the default Admin user and default asset categories."

    def handle(self, *args, **options):
        if not User.objects.filter(email="admin@lakmee.lk").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@lakmee.lk",
                password="Admin@1234",
                first_name="System",
                last_name="Admin",
                role=User.Role.ADMIN,
            )
            self.stdout.write(self.style.SUCCESS("Created default admin: admin@lakmee.lk / Admin@1234"))
        else:
            self.stdout.write("Admin user already exists, skipping.")

        defaults = [
            ("IT Equipment", "IT"),
            ("Vehicle", "VH"),
            ("Machinery", "MC"),
        ]
        for name, code in defaults:
            _, created = AssetCategory.objects.get_or_create(code=code, defaults={"name": name})
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {name} ({code})"))

        self.stdout.write(self.style.SUCCESS("Seed complete."))
