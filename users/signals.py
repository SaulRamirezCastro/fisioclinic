from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission

@receiver(post_migrate)
def create_roles(sender, **kwargs):
    admin_group, _ = Group.objects.get_or_create(name="Admin")
    fisio_group, _ = Group.objects.get_or_create(name="Fisio")

    # Admin: todos los permisos
    admin_group.permissions.set(Permission.objects.all())

    # Fisio: permisos específicos
    fisio_perms = Permission.objects.filter(
        codename__in=[
            "view_patient",
            "add_appointment",
            "change_appointment",
            "view_appointment",
        ]
    )
    fisio_group.permissions.set(fisio_perms)
