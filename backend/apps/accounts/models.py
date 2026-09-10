from django.contrib.auth.models import AbstractUser
from django.db import models
from simple_history.models import HistoricalRecords


class Department(models.Model):
    """A company department, e.g. IT, Sales, Warehouse. Scoped per organization —
    "IT" can exist independently in both PALLADION and Lakmee Holdings."""

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.PROTECT, related_name="departments"
    )
    name = models.CharField(max_length=100)
    head = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="headed_department",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["name"]
        unique_together = [["organization", "name"]]

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Custom user with the three system roles. Belongs to exactly one
    organization — that's what a login determines and what every queryset
    scopes against."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DEPT_HEAD = "DEPT_HEAD", "Department Head"
        EMPLOYEE = "EMPLOYEE", "Employee"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.PROTECT, related_name="users"
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    department = models.ForeignKey(
        Department,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="members",
    )
    phone = models.CharField(max_length=30, blank=True)
    is_active_employee = models.BooleanField(default=True)

    history = HistoricalRecords()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_dept_head(self):
        return self.role == self.Role.DEPT_HEAD

    @property
    def is_employee(self):
        return self.role == self.Role.EMPLOYEE
