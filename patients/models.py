from datetime import date

from django.db import models
from django.conf import settings

def patient_photo_path(instance, filename):
    """
    Guardar en: patients/{patient_id}/photos/{filename}
    Ejemplo: patients/123/photos/foto_perfil.jpg
    """
    return f'patients/{instance.id}/photos/{filename}'

class Patient(models.Model):
    # ===== DATOS GENERALES =====
    full_name = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)

    # ===== CONTACTO =====
    phone = models.CharField(max_length=20)
    phone_alt = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)

    # ===== DIRECCIÓN =====
    city = models.CharField(max_length=100,  null=True, blank=True)
    street = models.CharField(max_length=255, null=True, blank=True)
    neighborhood = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=10, null=True, blank=True)

    # ===== CLÍNICO =====
    diagnosis = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    # ===== INFORMACIÓN ADICIONAL DEL PACIENTE =====
    recommended_by = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Recomendado por"
    )

    chronic_diseases = models.TextField(
        blank=True,
        verbose_name="Enfermedades crónicas"
    )

    recent_surgeries = models.TextField(
        blank=True,
        verbose_name="Operaciones recientes"
    )

    photo = models.ImageField(
        upload_to=patient_photo_path,
        null=True,
        blank=True
    )

    # ===== META =====
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def age(self):
        if not self.birth_date:
            return None

        today = date.today()
        return (
            today.year
            - self.birth_date.year
            - (
                (today.month, today.day)
                < (self.birth_date.month, self.birth_date.day)
            )
        )

    class Meta:
        indexes = [
            models.Index(
                fields=["full_name"],
                name="appointment_name_idx"
            ),
            models.Index(
                fields=["email"],
                name="appointment_email_idx"
            )
        ]

    def __str__(self):
        return self.full_name


class Prescription(models.Model):
    patient = models.ForeignKey(
        Patient,
        related_name="prescriptions",
        on_delete=models.CASCADE
    )

    file = models.FileField(
        upload_to="prescriptions/"
    )

    description = models.CharField(
        max_length=255,
        blank=True,
        help_text="Descripción corta de la receta"
    )

    notes = models.TextField(
        blank=True,
        help_text="Indicaciones médicas"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receta - {self.patient.full_name}"


class ClinicalHistory(models.Model):
    patient = models.ForeignKey(
        "patients.Patient",
        related_name="clinical_history",
        on_delete=models.CASCADE
    )

    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    date = models.DateField(auto_now_add=True)

    diagnosis = models.TextField(blank=True, null=True)
    treatment = models.TextField()
    evolution = models.TextField(blank=True, null=True)
    pain_level = models.PositiveSmallIntegerField(
        blank=True, null=True,
        help_text="Escala 0–10"
    )
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.patient.full_name} - {self.date}"
