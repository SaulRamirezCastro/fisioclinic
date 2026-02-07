import React from "react";

type CalendarEvent = {
  id: number | string;
  title: string;
  start: string;
  end: string;
  extendedProps?: {
    status?: string;
  };
};

type Props = {
  appointments: CalendarEvent[];
};

export default function DailyAppointmentsList({
  appointments,
}: Props) {
  if (!appointments || appointments.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay citas para este día
      </p>
    );
  }

  // 🕒 ordenar por hora
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // 🔢 conteo por hora
  const byHour = sorted.reduce(
    (acc: Record<string, CalendarEvent[]>, a) => {
      const hour = new Date(a.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(a);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-5">

      {/* RESUMEN POR HORA */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(byHour).map(([hour, list]) => (
          <span
            key={hour} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">
            {hour} · {list.length}
          </span>
        ))}
      </div>

      {/* LISTA DE CITAS */}
      <div className="divide-y">
        {sorted.map((a) => (
          <div
            key={a.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-800">
                {a.title}
              </p>

              <p className="text-sm text-slate-500">
                {new Date(a.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(a.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <span className="text-sm text-slate-600">
              {a.extendedProps?.status ?? "confirmada"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
