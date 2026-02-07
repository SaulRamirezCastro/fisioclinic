from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Patient, Prescription, ClinicalHistory
from .serializers import PatientSerializer, PrescriptionSerializer, ClinicalHistorySerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter
from django.db.models import Max
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser




class PatientViewSet(ModelViewSet):

    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [SearchFilter]
    search_fields = ["full_name", "recommended_by",]

    def get_queryset(self):
        # 👈 base queryset SIN filtros peligrosos
        return Patient.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).order_by("-created_at")

        search = request.query_params.get("search")

        # # 🔹 ordenar por última cita
        # queryset = queryset.annotate(
        #     last_appointment=Max("appointments__date")
        # ).order_by("-last_appointment", "-created_at")

        # 🔹 sin búsqueda → solo los más recientes
        if not search:
            queryset = queryset[:20]

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        if not request.user.groups.filter(
                name__in=["Admin", "Fisio"]
        ).exists():
            raise PermissionDenied("No tienes permiso para editar pacientes")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.groups.filter(name="Admin").exists():
            raise PermissionDenied("Solo Admin puede eliminar pacientes")
        return super().destroy(request, *args, **kwargs)

    @action(
        detail=True,
        methods=["delete"],
        url_path="prescriptions/(?P<prescription_id>[^/.]+)"
    )
    def delete_prescription(self, request, pk=None, prescription_id=None):
        prescription = Prescription.objects.filter(
            id=prescription_id,
            patient_id=pk
        ).first()

        if not prescription:
            return Response(
                {"detail": "Receta no encontrada para este paciente"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔐 permiso clínico (opcional pero recomendado)
        if not request.user.groups.filter(
            name__in=["Admin", "Fisio"]
        ).exists():
            raise PermissionDenied("No tienes permiso para borrar recetas")

        prescription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["delete"])
    def delete_photo(self, request, pk=None):
        patient = self.get_object()
        if patient.photo:
            patient.photo.delete(save=True)
        return Response(
            {"message": "Foto eliminada"},
            status=status.HTTP_204_NO_CONTENT
        )


class PrescriptionViewSet(ModelViewSet):
    queryset = Prescription.objects.all().order_by("-created_at")
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post"]  # 👈 NO delete


class ClinicalHistoryViewSet(ModelViewSet):
    queryset = ClinicalHistory.objects.all()
    serializer_class = ClinicalHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ClinicalHistory.objects.all()
        patient_id = self.request.query_params.get("patient")

        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(therapist=self.request.user)
