import "@fullcalendar/react/dist/vdom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React from "react";

import { useState } from "react";
import { usePatientAppointments } from "./hooks/usePatientAppointments";
import AppointmentForm from "./AppointmentForm";
import AppointmentStatusPanel from "./AppointmentStatusPanel";
import Modal from "./ui/Modal";

type Props = {
  patientId: number;
};

export default function PatientCalendar({ patientId }: Props) {
  const { events, loading, createAppointment, updateStatus } =
    usePatientAppointments(patientId);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: number;
    status: string;
  } | null>(null);

  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-sm text-slate-500">Cargando citas…</p>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        selectable
        dateClick={(info) => setSelectedDate(info.dateStr)}
        eventClick={(info) =>
          setSelectedEvent({
            id: Number(info.event.id),
            status: info.event.extendedProps.status,
          })
        }
      />

      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <AppointmentStatusPanel
            appointmentId={selectedEvent.id}
            currentStatus={selectedEvent.status}
            onClose={() => setSelectedEvent(null)}
            onChange={async (status) => {
              await updateStatus(selectedEvent.id, status);
              setSelectedEvent(null);
            }}
          />
        )}
      </Modal>

    <Modal
      open={!!selectedDate}
      onClose={() => setSelectedDate(null)}
    >
      {selectedDate && (
        <AppointmentForm
          date={selectedDate}
          onCancel={() => setSelectedDate(null)}
          onSubmit={async (data) => {
            await createAppointment(data);
            setSelectedDate(null);
          }}
        />
      )}
    </Modal>
    </div>
  );
}

