import random
from datetime import timedelta, time

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from patients.models import Patient
from appointments.models import Appointment

fake = Faker("es_MX")

CLINIC_HOURS = [ 9, 10, 11, 12, 13, 16, 17, 18, 19]
DURATIONS = [ 60]


class Command(BaseCommand):
    help = "Genera citas para pacientes existentes (modelo actual)"

    def add_arguments(self, parser):
        parser.add_argument("--min", type=int, default=3)
        parser.add_argument("--max", type=int, default=10)
        parser.add_argument("--past_days", type=int, default=90)
        parser.add_argument("--future_days", type=int, default=30)

    def handle(self, *args, **options):
        patients = Patient.objects.all()
        now = timezone.localdate()

        if not patients.exists():
            self.stdout.write(self.style.ERROR(
                "❌ No hay pacientes en la base de datos"
            ))
            return

        self.stdout.write(
            f"📅 Generando citas para {patients.count()} pacientes..."
        )

        total_created = 0

        for patient in patients:
            appointments_count = random.randint(
                options["min"], options["max"]
            )

            base_day = now - timedelta(
                days=random.randint(0, options["past_days"])
            )

            for i in range(appointments_count):
                appointment_date = base_day + timedelta(
                    days=i * random.choice([2, 3, 4])
                )

                # evitar domingos
                if appointment_date.weekday() == 6:
                    appointment_date += timedelta(days=1)

                start_time = time(
                    random.choice(CLINIC_HOURS),
                    0
                )

                duration = random.choice(DURATIONS)

                # status coherente con fecha
                if appointment_date < now:
                    status = random.choice(
                        ["completed", "no_show", "cancelled"]
                    )
                    attended = status == "completed"
                elif appointment_date == now:
                    status = "scheduled"
                    attended = False
                else:
                    status = "scheduled"
                    attended = False

                Appointment.objects.create(
                    patient=patient,
                    date=appointment_date,
                    start_time=start_time,
                    duration_minutes=duration,
                    status=status,
                    attended=attended,
                    notes=fake.sentence()
                )

                total_created += 1

        self.stdout.write(self.style.SUCCESS(
            f"✅ {total_created} citas creadas correctamente"
        ))
