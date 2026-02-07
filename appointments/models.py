from django.db import models
from patients.models import Patient


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Programada"),
        ("completed", "Asistió"),
        ("cancelled", "Cancelada"),
        ("no_show", "No asistió"),
    ]

    patient = models.ForeignKey(
        Patient,
        related_name="appointments",  # 🔑 CLAVE
        on_delete=models.CASCADE
    )

    date = models.DateField()
    start_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=60)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="scheduled"
    )

    attended = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["date"],
                name="appointment_date_idx"
            ),
            models.Index(
                fields=["patient_id"],
                name="appointment_patient_idx"
            )
        ]

    def __str__(self):
        return f"{self.patient.full_name} - {self.date} {self.start_time}"

