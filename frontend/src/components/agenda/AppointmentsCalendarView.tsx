import "@fullcalendar/react/dist/vdom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import DailyAppointmentsList from "./DailyAppointmentsList";
import React from "react";

/* ===================== LOG CONFIGURATION ===================== */

const LOGS_ENABLED = false;

/* ===================== STATUS COLORS ===================== */

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6", // azul
  completed: "#10b981", // verde
  cancelled: "#ef4444", // rojo
  no_show:   "#6b7280", // gris
};

/* ===================== TYPES ===================== */

type CalendarEvent = {
  id: number | string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    status?: string;
  };
};

type Props = {
  loadCalendarAppointments: (
    start: string,
    end: string
  ) => Promise<CalendarEvent[]>;
};

type AlertType = "error" | "success" | "warning";

type AlertState = {
  type: AlertType;
  message: string;
} | null;

type AppointmentLog = {
  timestamp: string;
  action: 'STATUS_UPDATE' | 'TIME_CHANGE' | 'DATE_CHANGE' | 'LOAD_ERROR' | 'UPDATE_ERROR' | 'DAY_CLICK' | 'EVENT_CLICK' | 'DRAG_START';
  appointmentId: number | string;
  date: string;
  details: any;
};

/* ===================== HELPERS ===================== */

const toYYYYMMDD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateHours = () => {
  const hours: string[] = [];
  for (let h = 9; h < 14; h++) hours.push(`${String(h).padStart(2, "0")}:00`);
  for (let h = 16; h < 20; h++) hours.push(`${String(h).padStart(2, "0")}:00`);
  return hours;
};

const getTrafficLight = (count: number) => {
  if (count >= 7) return { emoji: "🔴", color: "bg-red-100 text-red-700" };
  if (count >= 4) return { emoji: "🟡", color: "bg-yellow-100 text-yellow-700" };
  return { emoji: "🟢", color: "bg-emerald-100 text-emerald-700" };
};

const getLocalDateString = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalTimeString = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/* ===================== COLOR HELPER ===================== */

const applyEventColors = (events: CalendarEvent[]): CalendarEvent[] =>
  events.map((e) => ({
    ...e,
    backgroundColor: STATUS_COLORS[e.extendedProps?.status ?? ""] ?? "#6b7280",
    borderColor:     STATUS_COLORS[e.extendedProps?.status ?? ""] ?? "#6b7280",
  }));

/* ===================== LOGGING SYSTEM ===================== */

const logAppointmentChange = (log: AppointmentLog) => {
  if (!LOGS_ENABLED) return;

  const formattedLog = {
    ...log,
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };

  console.log('📋 [APPOINTMENT_LOG]', JSON.stringify(formattedLog, null, 2));

  try {
    const logs = JSON.parse(localStorage.getItem('appointmentLogs') || '[]');
    logs.push(formattedLog);
    if (logs.length > 100) logs.shift();
    localStorage.setItem('appointmentLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error guardando logs:', error);
  }

  return formattedLog;
};

/* ===================== ALERT ===================== */

function Alert({ alert }: { alert: AlertState }) {
  if (!alert) return null;

  const styles = {
    error: "bg-red-100 text-red-800 border-red-300",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 border rounded-lg px-4 py-3 shadow ${styles[alert.type]}`}
    >
      {alert.message}
    </div>
  );
}

/* ===================== DAILY AVAILABILITY ===================== */

function DailyAvailabilityView({
  date,
  events,
}: {
  date: string;
  events: CalendarEvent[];
}) {
  const countAtHour = (hour: string) =>
    events.filter(
      (e) =>
        e.start.startsWith(`${date}T${hour}`) &&
        ["scheduled", "confirmed"].includes(e.extendedProps?.status ?? "")
    ).length;

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <h3 className="text-lg font-semibold">Disponibilidad · {date}</h3>

      <div className="flex gap-4 text-sm">
        <span>🟢 Disponible</span>
        <span>🟡 Casi lleno</span>
        <span>🔴 Lleno</span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {generateHours().map((hour) => {
          const count = countAtHour(hour);
          const light = getTrafficLight(count);

          return (
            <div
              key={hour}
              className={`flex justify-between items-center px-3 py-2 rounded border ${light.color}`}
            >
              <span className="font-medium">
                {light.emoji} {hour}
              </span>
              <span>{count} / 7</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== LEGEND ===================== */

function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-sm mb-2">
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-[#3b82f6]" />
        Programada
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-[#10b981]" />
        Asistió
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-[#ef4444]" />
        Cancelada
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-[#6b7280]" />
        No asistió
      </span>
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */

export default function AppointmentsCalendarView({
  loadCalendarAppointments,
}: Props) {
  const todayStr = toYYYYMMDD(new Date());

  const [calendarRange, setCalendarRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newStatus, setNewStatus] = useState("scheduled");
  const [pendingDrop, setPendingDrop] = useState<any>(null);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [alert, setAlert] = useState<AlertState>(null);

  const showAlert = (type: AlertType, message: string, timeout = 4000) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), timeout);
  };

  /* ===================== FUNCIONES PARA VER LOGS ===================== */

  useEffect(() => {
    if (!LOGS_ENABLED) return;

    (window as any).viewAppointmentLogs = () => {
      const logs = JSON.parse(localStorage.getItem('appointmentLogs') || '[]');
      console.table(logs);
      return logs;
    };

    (window as any).clearAppointmentLogs = () => {
      localStorage.removeItem('appointmentLogs');
      console.log('✅ Logs borrados');
    };

    (window as any).exportAppointmentLogs = () => {
      const logs = JSON.parse(localStorage.getItem('appointmentLogs') || '[]');
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `appointment-logs-${new Date().toISOString()}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    };
  }, []);

  /* ===================== LOAD EVENTS ===================== */

  useEffect(() => {
    if (!calendarRange) return;

    const load = async () => {
      try {
        if (LOGS_ENABLED) {
          console.log('🔄 [CARGA] Iniciando carga de citas:', {
            rangoInicio: calendarRange.start,
            rangoFin: calendarRange.end,
          });
        }

        const data = await loadCalendarAppointments(
          calendarRange.start,
          calendarRange.end
        );

        // ✅ Aplicar colores según el status
        setCalendarEvents(applyEventColors(data));

      } catch (error: any) {
        logAppointmentChange({
          timestamp: new Date().toISOString(),
          action: 'LOAD_ERROR',
          appointmentId: 'N/A',
          date: calendarRange.start,
          details: {
            rangeStart: calendarRange.start,
            rangeEnd: calendarRange.end,
            error: error.message,
            errorCode: error?.response?.status,
            success: false
          }
        });

        showAlert("error", "Error al cargar las citas");
      }
    };

    load();
  }, [calendarRange, loadCalendarAppointments]);

  const dayEvents = calendarEvents.filter(
    (e) =>
      toYYYYMMDD(new Date(e.start)) === selectedDate &&
      e.extendedProps?.status === "scheduled"
  );

  /* ===================== UPDATE STATUS ===================== */

  const updateAppointmentStatus = async () => {
    if (!selectedEvent) return;

    const oldStatus = selectedEvent.extendedProps?.status;

    try {
      await api.patch(`/appointments/${selectedEvent.id}/`, {
        status: newStatus,
      });

      logAppointmentChange({
        timestamp: new Date().toISOString(),
        action: 'STATUS_UPDATE',
        appointmentId: selectedEvent.id,
        date: toYYYYMMDD(new Date(selectedEvent.start)),
        details: {
          title: selectedEvent.title,
          oldStatus,
          newStatus,
          startTime: selectedEvent.start,
          success: true
        }
      });

      await refreshCalendar();
      showAlert("success", "Estado actualizado");
      setSelectedEvent(null);

    } catch (error: any) {
      logAppointmentChange({
        timestamp: new Date().toISOString(),
        action: 'UPDATE_ERROR',
        appointmentId: selectedEvent.id,
        date: toYYYYMMDD(new Date(selectedEvent.start)),
        details: {
          title: selectedEvent.title,
          attemptedStatus: newStatus,
          error: error?.response?.data?.detail || error.message,
          errorCode: error?.response?.status,
          success: false
        }
      });

      showAlert(
        "error",
        error?.response?.data?.detail ?? "Error al actualizar el estado"
      );
    }
  };

  /* ===================== AVAILABILITY ===================== */

  const countAppointmentsAtHour = (
    date: string,
    hour: string,
    excludeId?: number | string
  ) =>
    calendarEvents.filter((e) => {
      if (excludeId && e.id === excludeId) return false;
      return (
        e.start.startsWith(`${date}T${hour}`) &&
        ["scheduled", "confirmed"].includes(e.extendedProps?.status ?? "")
      );
    }).length;

  const getAvailability = (date: string, excludeId?: number | string) =>
    generateHours().map((hour) => {
      const count = countAppointmentsAtHour(date, hour, excludeId);
      return { hour, count, available: count < 6 };
    });

  /* ===================== DRAG & DROP ===================== */

  const handleEventDrop = (info: any) => {
    const localTime = getLocalTimeString(info.event.start);
    const localDate = getLocalDateString(info.event.start);

    setSelectedTime(localTime);

    logAppointmentChange({
      timestamp: new Date().toISOString(),
      action: 'DRAG_START',
      appointmentId: info.event.id,
      date: localDate,
      details: {
        title: info.event.title,
        newDate: localDate,
        newTime: localTime,
        draggedFrom: {
          date: getLocalDateString(info.oldEvent.start),
          time: getLocalTimeString(info.oldEvent.start)
        }
      }
    });

    setPendingDrop(info);
    setTimeModalOpen(true);
  };

  const confirmDropTime = async () => {
    if (!pendingDrop) return;

    const event = pendingDrop.event;
    const date = getLocalDateString(event.start);
    const oldDate = event._def.extendedProps.originalDate || getLocalDateString(pendingDrop.oldEvent.start);
    const oldTime = event._def.extendedProps.originalTime || getLocalTimeString(pendingDrop.oldEvent.start);

    if (countAppointmentsAtHour(date, selectedTime, event.id) >= 7) {
      logAppointmentChange({
        timestamp: new Date().toISOString(),
        action: 'TIME_CHANGE',
        appointmentId: event.id,
        date: date,
        details: {
          title: event.title,
          oldDate,
          oldTime,
          attemptedDate: date,
          attemptedTime: selectedTime,
          reason: 'No hay cupo disponible',
          success: false
        }
      });

      showAlert("warning", "No hay cupo disponible");
      pendingDrop.revert();
      setTimeModalOpen(false);
      return;
    }

    try {
      await api.patch(`/appointments/${event.id}/`, {
        date,
        start_time: selectedTime,
      });

      logAppointmentChange({
        timestamp: new Date().toISOString(),
        action: oldDate !== date ? 'DATE_CHANGE' : 'TIME_CHANGE',
        appointmentId: event.id,
        date: date,
        details: {
          title: event.title,
          oldDate,
          oldTime,
          newDate: date,
          newTime: selectedTime,
          success: true
        }
      });

      await refreshCalendar();
      showAlert("success", "Horario actualizado");

    } catch (error: any) {
      logAppointmentChange({
        timestamp: new Date().toISOString(),
        action: 'UPDATE_ERROR',
        appointmentId: event.id,
        date: date,
        details: {
          title: event.title,
          attemptedDate: date,
          attemptedTime: selectedTime,
          error: error?.response?.data?.detail || error.message,
          errorCode: error?.response?.status,
          success: false
        }
      });

      pendingDrop.revert();
      showAlert(
        "error",
        error?.response?.data?.detail ?? "Error al actualizar horario"
      );
    } finally {
      setTimeModalOpen(false);
      setPendingDrop(null);
    }
  };

  const availability = pendingDrop
    ? getAvailability(
        getLocalDateString(pendingDrop.event.start),
        pendingDrop.event.id
      )
    : [];

  const refreshCalendar = async () => {
    if (!calendarRange) return;
    const data = await loadCalendarAppointments(
      calendarRange.start,
      calendarRange.end
    );
    // ✅ Aplicar colores también al refrescar
    setCalendarEvents(applyEventColors(data));
  };

  /* ===================== RENDER ===================== */

  return (
    <>
      <Alert alert={alert} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <DailyAvailabilityView
            date={selectedDate}
            events={calendarEvents}
          />

          <div className="bg-white rounded-xl shadow p-4 h-[400px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              Citas · {selectedDate}
            </h2>
            <div className="overflow-y-auto flex-1">
              <DailyAppointmentsList appointments={dayEvents} />
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
          {/* ✅ Leyenda de colores */}
          <CalendarLegend />

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable
            initialDate={todayStr}
            events={calendarEvents}
            eventDrop={handleEventDrop}
            dateClick={(info) => {
              logAppointmentChange({
                timestamp: new Date().toISOString(),
                action: 'DAY_CLICK',
                appointmentId: 'N/A',
                date: info.dateStr,
                details: {
                  previousDate: selectedDate,
                  newDate: info.dateStr,
                }
              });

              setSelectedDate(info.dateStr);
            }}
            datesSet={(info) =>
              setCalendarRange({
                start: toYYYYMMDD(info.start),
                end: toYYYYMMDD(info.end),
              })
            }
            eventClick={(info) => {
              logAppointmentChange({
                timestamp: new Date().toISOString(),
                action: 'EVENT_CLICK',
                appointmentId: info.event.id,
                date: toYYYYMMDD(info.event.start!),
                details: {
                  title: info.event.title,
                  status: info.event.extendedProps?.status,
                  startTime: info.event.start!.toISOString(),
                  endTime: info.event.end!.toISOString()
                }
              });

              setSelectedDate(toYYYYMMDD(info.event.start!));
              setSelectedEvent({
                id: info.event.id,
                title: info.event.title,
                start: info.event.start!.toISOString(),
                end: info.event.end!.toISOString(),
                extendedProps: info.event.extendedProps,
              });
              setNewStatus(info.event.extendedProps?.status ?? "scheduled");
            }}
          />
        </div>
      </div>

      {/* ===================== STATUS MODAL ===================== */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="font-semibold">{selectedEvent.title}</h3>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="scheduled">Programada</option>
              <option value="completed">Asistió</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistió</option>
            </select>

            <div className="flex gap-2">
              <button
                className="flex-1 bg-emerald-600 text-white rounded py-2"
                onClick={updateAppointmentStatus}
              >
                Guardar
              </button>
              <button
                className="flex-1 bg-slate-200 rounded py-2"
                onClick={() => setSelectedEvent(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TIME MODAL ===================== */}
      {timeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-3">
            <h3 className="font-semibold">Seleccionar hora</h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availability.map((slot) => {
                const light = getTrafficLight(slot.count);

                return (
                  <button
                    key={slot.hour}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.hour)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded border
                      ${light.color}
                      ${
                        !slot.available
                          ? "opacity-70 cursor-not-allowed"
                          : selectedTime === slot.hour
                          ? "ring-2 ring-emerald-600"
                          : "hover:bg-slate-100"
                      }`}
                  >
                    <span>
                      {light.emoji} {slot.hour}
                    </span>
                    <span>{slot.count} / 7</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 bg-emerald-600 text-white rounded py-2"
                onClick={confirmDropTime}
              >
                Confirmar
              </button>
              <button
                className="flex-1 bg-slate-200 rounded py-2"
                onClick={() => {
                  pendingDrop?.revert();
                  setTimeModalOpen(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
