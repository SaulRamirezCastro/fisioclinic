import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import AttendanceTemplate, { AttendanceTemplateRef } from "./AttendanceTemplate";
import React from "react";

/* =============================
   Tipos
============================= */
type Props = {
  patient: {
    id: number;
    full_name: string;
  };
};

type Mode = "report" | "bitacora";

type ReportResponse = {
  total: number;
  attended: number;
  no_show: number;
  cancelled: number;
  attendance_rate: number;
};

/* =============================
   Helpers
============================= */

const sortDates = (dates: string[]) =>
  [...dates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

const formatDate = (date: string) => {
  const formatted = new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return formatted.replace(/\b\w/g, (c) => c.toUpperCase());
};

/* =============================
   Componente Principal
============================= */
export default function PatientReport({ patient }: Props) {
  const attendanceRef = useRef<AttendanceTemplateRef>(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [attendedDates, setAttendedDates] = useState<string[]>([]);

  const [mode, setMode] = useState<Mode>("report");
  const [loading, setLoading] = useState(false);

  /* =============================
     API Calls
  ============================= */

  const fetchReportData = async () => {
    if (!start || !end) {
      alert("Debe seleccionar un periodo de fechas");
      return;
    }

    try {
      setLoading(true);

      const [reportRes, attendedRes] = await Promise.all([
        api.get("appointments/patient-report/", {
          params: { patient: patient.id, start, end },
        }),
        api.get("appointments/attended-sessions/", {
          params: { patient: patient.id, start, end },
        }),
      ]);

      setReport(reportRes.data);
      setAttendedDates(sortDates(attendedRes.data.rows || []));
    } finally {
      setLoading(false);
    }
  };

  const fetchBitacora = async () => {
    if (!start || !end) {
      alert("Debe seleccionar un periodo de fechas");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("appointments/attended-sessions/", {
        params: { patient: patient.id, start, end },
      });

      setAttendedDates(sortDates(res.data.rows || []));
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     Reset data cuando cambia modo
  ============================= */
  useEffect(() => {
    setReport(null);
    setAttendedDates([]);
  }, [patient.id, mode]);

  /* =============================
     Render
  ============================= */
  return (
    <div className="space-y-6">

      <Header patient={patient.full_name} />

      <ModeSelector mode={mode} setMode={setMode} />

      <Filters
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        mode={mode}
        loading={loading}
        onReport={fetchReportData}
        onBitacora={fetchBitacora}
      />

      {loading && <Loader />}

      {/* ===== Reporte ===== */}
      {mode === "report" && report && (
        <div className="space-y-6">
          <StatsGrid report={report} />
          <AttendedDatesList dates={attendedDates} />
        </div>
      )}

      {/* ===== Bitácora ===== */}
      {mode === "bitacora" && (
        <>
          {attendedDates.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="text-right">
                <button
                  onClick={() => attendanceRef.current?.print()}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg"
                >
                  🖨️ Imprimir
                </button>
              </div>
              <AttendanceTemplate
                ref={attendanceRef}
                patientName={patient.full_name}
                periodStart={start}
                periodEnd={end}
                attendedDates={attendedDates}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

/* =============================
   UI Components
============================= */

function Header({ patient }: { patient: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Consultas del paciente</h2>
      <p className="text-slate-500">{patient}</p>
    </div>
  );
}

function ModeSelector({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div className="flex gap-2">
      <ModeButton active={mode === "report"} label="Reporte Citas" onClick={() => setMode("report")} />
      <ModeButton active={mode === "bitacora"} label="Bitácora de Asistencia" onClick={() => setMode("bitacora")} />
    </div>
  );
}

function ModeButton({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl ${
        active ? "bg-emerald-600 text-white" : "bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({ loading, label, onClick, variant }: any) {
  const variants: Record<string, string> = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  };

  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${variants[variant]} text-white px-4 py-2 rounded-xl transition`}
    >
      {label}
    </button>
  );
}

function Filters({
  start,
  end,
  setStart,
  setEnd,
  mode,
  loading,
  onReport,
  onBitacora,
}: any) {
  return (
    <div className="flex gap-4 items-end">

      <DateInput label="Desde" value={start} onChange={setStart} />
      <DateInput label="Hasta" value={end} onChange={setEnd} />

      {mode === "report" && (
        <ActionButton
          loading={loading}
          label="Consultar"
          variant="emerald"
          onClick={onReport}
        />
      )}

      {mode === "bitacora" && (
        <ActionButton
          loading={loading}
          label="Generar bitácora"
          variant="indigo"
          onClick={onBitacora}
        />
      )}
    </div>
  );
}

function DateInput({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}

function Loader() {
  return (
    <div className="text-slate-500 text-sm">
      Procesando información...
    </div>
  );
}

function StatsGrid({ report }: { report: ReportResponse }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <Stat label="Total citas" value={report.total} />
      <Stat label="Asistidas" value={report.attended} />
      <Stat label="No asistió" value={report.no_show} />
      <Stat label="Canceladas" value={report.cancelled} />
      <Stat label="% Asistencia" value={`${report.attendance_rate}%`} />
    </div>
  );
}

function AttendedDatesList({ dates }: { dates: string[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">
        Fechas asistidas ({dates.length})
      </h3>

      {dates.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No hay asistencias en el periodo.
        </p>
      ) : (
        <div className="max-h-56 overflow-y-auto border rounded-lg p-3">
          <ul className="space-y-1 text-sm">
            {dates.map((date, i) => (
              <li key={i} className="border-b last:border-none py-1">
                {formatDate(date)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      No hay sesiones asistidas en el rango seleccionado.
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
