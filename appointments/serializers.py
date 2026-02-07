from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.full_name",
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = "__all__"


class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.full_name",
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient_name",
            "date",
            "start_time",
            "duration_minutes",
            "status",
        ]
