import React from "react";

type Props = {
  appointmentId: number;
  currentStatus: string;
  onClose: () => void;
  onChange: (status: string) => void;
};

export default function AppointmentStatusPanel({
  appointmentId,
  currentStatus,
  onClose,
  onChange,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold">Estado de la cita</h3>

      <select
        className="input"
        defaultValue={currentStatus}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="scheduled">Programada</option>
        <option value="completed">Asistió</option>
        <option value="no_show">No asistió</option>
        <option value="cancelled">Cancelada</option>
      </select>

      <div className="flex justify-end">
        <button
          className="text-sm text-slate-500 hover:underline"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
