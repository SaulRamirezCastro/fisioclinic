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

    photo_url = serializers.SerializerMethodField()
    
    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "El teléfono solo debe contener números")
        return value

     def get_photo_url(self, obj):
        """
        Retorna la URL completa de la foto
        """
        if obj.photo:
            request = self.context.get('request')
            if request:
                # Construir URL absoluta correcta
                return request.build_absolute_uri(obj.photo.url)
            else:
                # Fallback si no hay request en el contexto
                from django.conf import settings
                if hasattr(settings, 'RENDER_EXTERNAL_HOSTNAME'):
                    hostname = settings.RENDER_EXTERNAL_HOSTNAME
                    return f'https://{hostname}{obj.photo.url}'
                return obj.photo.url
                
        return None

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
