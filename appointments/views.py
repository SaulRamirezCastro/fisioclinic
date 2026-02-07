from datetime import datetime, timedelta

from django.db.models import Count
from django.utils.dateparse import parse_date

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentListSerializer,
)


class AppointmentViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = (
        Appointment.objects
        .select_related("patient")
        .order_by("date", "start_time")
    )

    # =========================================================
    # 🔁 SERIALIZERS
    # =========================================================
    def get_serializer_class(self):
        if self.action == "list":
            return AppointmentListSerializer
        if self.action == "calendar":
            return None
        return AppointmentSerializer

    # =========================================================
    # 🧩 QUERYSET BASE
    # =========================================================
    def get_queryset(self):
        qs = super().get_queryset()

        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        return qs

    # =========================================================
    # 📅 FULLCALENDAR
    # =========================================================
    @action(detail=False, methods=["get"])
    def calendar(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        patient_id = request.query_params.get("patient")

        qs = (
            Appointment.objects
            .select_related("patient")
            .only(
                "id",
                "date",
                "start_time",
                "duration_minutes",
                "status",
                "attended",
                "patient__full_name",
            )
        )

        if start and end:
            qs = qs.filter(date__gte=start, date__lt=end)

        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        events = []
        for a in qs.order_by("date", "start_time"):
            start_dt = datetime.combine(a.date, a.start_time)
            end_dt = start_dt + timedelta(minutes=a.duration_minutes)

            events.append({
                "id": a.id,
                "title": a.patient.full_name,
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat(),
                "extendedProps": {
                    "status": a.status,
                    "attended": a.attended,
                },
            })

        return Response(events)

    # =========================================================
    # 📋 BITÁCORA (SESIONES ASISTIDAS)
    # =========================================================
    @action(detail=False, methods=["get"], url_path="attended-sessions")
    def bitacora(self, request):
        patient_id = request.query_params.get("patient")

        if not patient_id:
            return Response(
                {"detail": "patient parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start, end = self._parse_dates(request)
        if not start or not end:
            return Response(
                {"detail": "start and end parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = (
            Appointment.objects
            .select_related("patient")
            .filter(
                patient_id=patient_id,
                status="completed",
                date__range=(start, end),
            )
            .order_by("date")
        )

        # 📅 Fechas únicas (YYYY-MM-DD)
        dates = (
            qs.values_list("date", flat=True)
            .distinct()
        )

        print(dates)

        patient_name = qs.first().patient.full_name if qs.exists() else None
        first_date = dates.first()

        return Response({
            "patient": patient_name,
            "month": (
                first_date.strftime("%B %Y").upper()
                if first_date
                else ""
            ),
            "date_range": {
                "start": start,
                "end": end,
            },
            "rows": [
                d.strftime("%Y-%m-%d") for d in dates
            ],
        })

    # =========================================================
    # 📊 REPORTE ESTADÍSTICO POR PACIENTE
    # =========================================================
    @action(detail=False, methods=["get"], url_path="patient-report")
    def patient_report(self, request):
        patient_id = request.query_params.get("patient")
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        if not patient_id:
            return Response(
                {"detail": "patient parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = Appointment.objects.filter(patient_id=patient_id)

        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)

        total = qs.count()
        attended = qs.filter(status="completed").count()
        no_show = qs.filter(status="no_show").count()
        cancelled = qs.filter(status="cancelled").count()

        attendance_rate = round(
            (attended / total * 100), 2
        ) if total else 0

        by_status = (
            qs.values("status")
            .annotate(total=Count("id"))
        )

        return Response({
            "patient_id": patient_id,
            "total": total,
            "attended": attended,
            "no_show": no_show,
            "cancelled": cancelled,
            "attendance_rate": attendance_rate,
            "by_status": by_status,
        })

    # =========================================================
    # 🛠 HELPERS
    # =========================================================
    def _parse_dates(self, request):
        start = parse_date(request.query_params.get("start"))
        end = parse_date(request.query_params.get("end"))
        return start, end
