import { useEffect, useState } from "react";
import api from "../../../api/axios";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6",
  completed: "#10b981",
  no_show: "#ef4444",
  cancelled: "#6b7280",
};

export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    status: string;
    duration: number;
  };
};

export function usePatientAppointments(patientId: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const res = await api.get("appointments/", {
        params: { patient: patientId },
      });

      setEvents(
        res.data.map((a: any) => ({
          id: a.id,
          title: a.start_time.slice(0, 5),
          start: `${a.date}T${a.start_time}`,
          backgroundColor: STATUS_COLORS[a.status],
          borderColor: STATUS_COLORS[a.status],
          extendedProps: {
            status: a.status,
            duration: a.duration_minutes,
          },
        }))
      );
    } catch (error: any) {
      console.error(
        "Error cargando citas:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (payload: {
    date: string;
    start_time: string;
    duration_minutes: number;
  }) => {
    try {
      await api.post("appointments/", {
        patient: patientId,
        status: "scheduled", // 🔑 CLAVE
        ...payload,
      });

      await loadAppointments();
    } catch (error: any) {
      console.error(
        "Error creando cita:",
        error.response?.data || error
      );
      throw error; // importante para que el modal lo sepa
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`appointments/${id}/`, { status });
      await loadAppointments();
    } catch (error: any) {
      console.error(
        "Error actualizando estado:",
        error.response?.data || error
      );
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [patientId]);

  return {
    events,
    loading,
    createAppointment,
    updateStatus,
  };
}
