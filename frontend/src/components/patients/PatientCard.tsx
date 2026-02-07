import React from "react";

type PatientCardProps = {
  patient: any; // tipar luego
  onOpen: () => void;
  onPrescription: () => void;
};

export default function PatientCard({
  patient,
  onOpen,
  onPrescription,
}: PatientCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver ficha de ${patient.full_name}`}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="
        group cursor-pointer
        bg-white rounded-xl p-4
        flex items-center justify-between gap-4
        shadow-sm
        hover:shadow-md hover:bg-slate-50
        active:scale-[0.99]
        transition-all
        focus:outline-none focus:ring-2 focus:ring-emerald-500
      "
    >
      {/* ================= IZQUIERDA ================= */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar + estado */}
        <div className="relative shrink-0">
          {patient.photo ? (
            <img
              src={patient.photo}
              alt={patient.full_name}
              className="w-11 h-11 rounded-full object-cover border"
            />
          ) : (
            <div className="
              w-11 h-11 rounded-full
              bg-emerald-100 text-emerald-700
              font-semibold flex items-center justify-center
            ">
              {patient.full_name?.charAt(0)}
            </div>
          )}

        </div>

        {/* Info principal */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 truncate">
              {patient.full_name}
            </span>

          </div>

          <div className="text-sm text-slate-500 truncate">
            📞 {patient.phone || "—"}
            {patient.email && <span> · 📧 {patient.email}</span>}
          </div>

          <div className="text-xs text-slate-400 truncate">
            📍 {[patient.street, patient.neighborhood, patient.city]
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      </div>

      {/* ================= ACCIONES ================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          flex gap-2
          opacity-100 md:opacity-0
          md:group-hover:opacity-100
          md:group-focus-within:opacity-100
          transition
        "
      >
        <button
          onClick={onOpen}
          aria-label="Ver paciente"
          className="
            text-sm text-slate-600
            hover:text-slate-800
            px-2 py-1 rounded
            hover:bg-slate-100
          "
        >
          👁 Ver
        </button>

        <button
          onClick={onPrescription}
          aria-label="Nueva receta"
          className="
            text-sm text-emerald-600
            hover:text-emerald-700
            px-2 py-1 rounded
            hover:bg-emerald-50
          "
        >
          📄 Nueva receta
        </button>
      </div>
    </div>
  );
}
