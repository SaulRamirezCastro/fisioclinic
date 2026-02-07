import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [report, setReport] = useState<any>(null);

  const loadReport = async () => {
    const res = await api.get("appointments/attendance_report/", {
      params: { start, end },
    });
    setReport(res.data);
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Reporte de asistencia
      </h1>

      {/* Filtros */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm">Desde</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="text-sm">Hasta</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input"
          />
        </div>

        <button
          onClick={loadReport}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl self-end"
        >
          Filtrar
        </button>
      </div>

      {/* Métricas */}
      {report && (
        <div className="grid grid-cols-5 gap-4">
          <Stat label="Total" value={report.total} />
          <Stat label="Asistidas" value={report.attended} />
          <Stat label="No asistió" value={report.no_show} />
          <Stat label="Canceladas" value={report.cancelled} />
          <Stat
            label="% Asistencia"
            value={`${report.attendance_rate}%`}
          />
        </div>
      )}

      {/* Detalle */}
      {report && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">
            Detalle por estado
          </h2>

          <ul className="space-y-2">
            {report.by_status.map((s: any) => (
              <li
                key={s.status}
                className="flex justify-between border-b pb-1"
              >
                <span>{s.status}</span>
                <span>{s.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
