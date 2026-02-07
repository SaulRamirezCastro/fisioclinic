import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker

from patients.models import Patient, Prescription, ClinicalHistory

fake = Faker("es_MX")
User = get_user_model()


class Command(BaseCommand):
    help = "Genera pacientes, recetas e historial clínico de prueba"

    def add_arguments(self, parser):
        parser.add_argument(
            "--patients",
            type=int,
            default=1000,
            help="Número de pacientes a crear (default: 1000)"
        )

    def handle(self, *args, **options):
        total_patients = options["patients"]

        therapists = list(User.objects.all())
        if not therapists:
            self.stdout.write(self.style.ERROR(
                "⚠️ No hay usuarios (terapeutas) en la BD"
            ))
            return

        patients_created = []

        self.stdout.write(f"🚀 Creando {total_patients} pacientes...")

        for i in range(total_patients):
            birth_date = fake.date_of_birth(
                minimum_age=6,
                maximum_age=90
            )

            patient = Patient.objects.create(
                full_name=fake.name(),
                birth_date=birth_date,
                phone=fake.msisdn()[:10],
                phone_alt=fake.msisdn()[:10] if random.choice([True, False]) else "",
                email=fake.email(),
                emergency_contact=fake.name(),
                city=fake.city(),
                street=fake.street_address(),
                neighborhood="",
                state=fake.state(),
                postal_code=fake.postcode(),
                diagnosis=random.choice([
                    "Lumbalgia",
                    "Cervicalgia",
                    "Esguince de tobillo",
                    "Lesión de rodilla",
                    "Hombro doloroso",
                    "Rehabilitación postoperatoria",
                ]),
                notes=fake.text(max_nb_chars=200),
            )

            patients_created.append(patient)

            # 60% con receta
            if random.random() < 0.6:
                Prescription.objects.create(
                    patient=patient,
                    file="prescriptions/demo.pdf",
                    description="Ejercicios terapéuticos",
                    notes="Seguir indicaciones del terapeuta"
                )

            # 1–5 registros clínicos
            for _ in range(random.randint(1, 5)):
                ClinicalHistory.objects.create(
                    patient=patient,
                    therapist=random.choice(therapists),
                    diagnosis=patient.diagnosis,
                    treatment=random.choice([
                        "Electroterapia",
                        "Terapia manual",
                        "Ejercicios de fortalecimiento",
                        "Crioterapia",
                        "Ultrasonido"
                    ]),
                    evolution=random.choice([
                        "Mejoría progresiva",
                        "Dolor estable",
                        "Disminución del dolor",
                        "Aumento leve del rango de movimiento"
                    ]),
                    pain_level=random.randint(0, 10),
                    notes=fake.sentence()
                )

            if (i + 1) % 100 == 0:
                self.stdout.write(f"✔ {i + 1} pacientes creados")

        self.stdout.write(self.style.SUCCESS(
            f"🎉 {total_patients} pacientes generados correctamente"
        ))
