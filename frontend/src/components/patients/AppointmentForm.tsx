import Button from "../Button";
import { useState } from "react";
import React from "react";

type Props = {
  date: string;
  onCancel: () => void;
  onSubmit: (data: {
    date: string;
    start_time: string;
    duration_minutes: number;
  }) => void;
};

export default function AppointmentForm({ date, onCancel, onSubmit }: Props) {
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);

  return (
    <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
      <h3 className="font-semibold">Nueva cita · {date}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Hora inicio</label>
          <input
            type="time"
            className="input"
            step="900"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Duración (min)</label>
          <input
            type="number"
            className="input"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() =>
            onSubmit({
              date,
              start_time: startTime,
              duration_minutes: duration,
            })
          }
        >
          Agendar
        </Button>
      </div>
    </div>
  );
}
