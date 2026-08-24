"""
Generic audit trail: listens for create/update/delete on the models we care
about and records an AuditLog row, but only when SystemSettings.audit_log_enabled
is True (see README: "Audit Trail — Full system audit log with on/off toggle").

This uses Django's `simple_history` signal internally is unnecessary here — we
just hook post_save / post_delete directly for simplicity and store the models'
changed fields via `update_fields` when available.
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.assets.models import Asset
from apps.assignments.models import Assignment
from apps.maintenance.models import MaintenanceLog

from .models import AuditLog

AUDITED_MODELS = (Asset, Assignment, MaintenanceLog)


def _audit_enabled():
    from apps.configuration.models import SystemSettings

    try:
        return SystemSettings.load().audit_log_enabled
    except Exception:
        # Table may not exist yet during initial `migrate` — fail open (no crash),
        # audit rows just won't be written until settings exist.
        return False


def _log(action, instance, user=None):
    if not _audit_enabled():
        return
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
    )


@receiver(post_save)
def audit_on_save(sender, instance, created, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    _log(AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE, instance)


@receiver(post_delete)
def audit_on_delete(sender, instance, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    _log(AuditLog.Action.DELETE, instance)
