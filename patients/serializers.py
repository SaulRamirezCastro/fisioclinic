from rest_framework import serializers
from .models import Patient, Prescription, ClinicalHistory
from appointments.serializers import AppointmentSerializer


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = "__all__"


class PatientSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    last_appointment = serializers.DateTimeField(read_only=True)

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "El teléfono solo debe contener números")
        return value

    class Meta:
        model = Patient
        fields = "__all__"


class ClinicalHistorySerializer(serializers.ModelSerializer):
    therapist_name = serializers.CharField(
        source="therapist.username",
        read_only=True
    )

    class Meta:
        model = ClinicalHistory
        fields = "__all__"