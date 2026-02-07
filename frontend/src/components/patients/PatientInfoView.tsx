import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import PatientPrescriptionsList from "./PatientPrescriptions";
import ConfirmModal from "../ConfirmModal";
import api from "../../api/axios";

/* =======================
   TYPES
======================= */

type Patient = {
  id: number;
  full_name: string;
  age?: number | null;
  birth_date?: string | null;
  photo?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_alt?: string | null;
  emergency_contact?: string | null;
  recommended_by?: string | null;
  street?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  chronic_diseases?: string | null;
  recent_surgeries?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  prescriptions?: any[];
};

type Props = {
  patient: Patient;
  onEdit: () => void;
  onViewAllPrescriptions: () => void;
  onDeleted?: (patientId: number) => void;
};

/* =======================
   HELPERS
======================= */

const Empty = ({ text }: { text: string }) => (
  <span className="text-slate-400 italic">{text}</span>
);

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  return birthdayPassed ? age : age - 1;
}

function formatDate(date?: string | null) {
  if (!date) return null;

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =======================
   COMPONENT
======================= */

export default function PatientInfoView({
  patient,
  onEdit,
  onViewAllPrescriptions,
  onDeleted,
}: Props) {
  const navigate = useNavigate();

  /* -----------------------
     LOCAL STATE
  ----------------------- */

  const [localPatient, setLocalPatient] = useState(patient);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* -----------------------
     SYNC PROPS → LOCAL STATE
  ----------------------- */

  useEffect(() => {
    setLocalPatient(patient);
  }, [patient]);

  /* -----------------------
     DERIVED DATA
  ----------------------- */

  const age = useMemo(() => {
    return typeof localPatient.age === "number"
      ? localPatient.age
      : calculateAge(localPatient.birth_date);
  }, [localPatient.age, localPatient.birth_date]);

  /* -----------------------
     DELETE PATIENT
  ----------------------- */

  const handleDeletePatient = async () => {
    try {
      setIsDeleting(true);

      await api.delete(`/patients/${localPatient.id}/`);

      setShowDeleteModal(false);
      onDeleted?.(localPatient.id);
      navigate("/patients", { replace: true });

    } catch (error) {
      console.error(error);
      alert("No se pudo borrar el paciente");
    } finally {
      setIsDeleting(false);
    }
  };

  /* -----------------------
     DELETE PRESCRIPTION (Optimistic)
  ----------------------- */

  const handlePrescriptionDeleted = (deletedId: number) => {
    setLocalPatient((prev) => ({
      ...prev,
      prescriptions:
        prev.prescriptions?.filter((p: any) => p.id !== deletedId) ?? [],
    }));
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-8">

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        <Button onClick={onEdit}>
          ✏️ Editar información
        </Button>

        <Button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          🗑️ Borrar paciente
        </Button>
      </div>

      {/* HEADER */}
      <section className="flex flex-col md:flex-row gap-6">

        <div className="w-40 h-40 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm shrink-0">
          {localPatient.photo ? (
            <img
              src={localPatient.photo}
              alt={localPatient.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-400 text-4xl font-semibold">
              {localPatient.full_name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <h1 className="text-xl font-semibold text-slate-800">
            {localPatient.full_name}
          </h1>

          <p className="text-slate-600 text-sm">
            <strong>Edad:</strong>{" "}
            {typeof age === "number"
              ? `${age} años`
              : <Empty text="No registrada" />}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Fecha de nacimiento:</strong>{" "}
              {localPatient.birth_date
                ? formatDate(localPatient.birth_date)
                : <Empty text="No registrada" />}
            </p>

            <p><strong>Email:</strong> {localPatient.email || <Empty text="No registrado"/>}</p>
            <p><strong>Teléfono:</strong> {localPatient.phone || <Empty text="No registrado"/>}</p>
            <p><strong>Tel. alternativo:</strong> {localPatient.phone_alt || "—"}</p>
            <p><strong>Contacto emergencia:</strong> {localPatient.emergency_contact || "—"}</p>
            <p><strong>Recomendado por:</strong> {localPatient.recommended_by || "—"}</p>
          </div>
        </div>
      </section>

      {/* ADDRESS */}
      <section>
        <details>
          <summary className="cursor-pointer font-semibold text-slate-700">
            Dirección
          </summary>

          <div className="mt-3 text-sm text-slate-600 space-y-1">
            <p><strong>Calle:</strong> {localPatient.street || "—"}</p>
            <p><strong>Colonia:</strong> {localPatient.neighborhood || "—"}</p>
            <p><strong>Ciudad:</strong> {localPatient.city || "—"}</p>

            {(localPatient.state || localPatient.postal_code) && (
              <p>
                {[localPatient.state, localPatient.postal_code]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </details>
      </section>

      {/* CLINICAL INFO */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">
          Información clínica
        </h2>

        <p>
          <strong>Enfermedades crónicas:</strong>{" "}
          {localPatient.chronic_diseases || <Empty text="No registradas" />}
        </p>

        <p>
          <strong>Operaciones recientes:</strong>{" "}
          {localPatient.recent_surgeries || <Empty text="No registradas" />}
        </p>

        <p>
          <strong>Diagnóstico:</strong>{" "}
          {localPatient.diagnosis || <Empty text="Sin diagnóstico" />}
        </p>

        {localPatient.notes && (
          <p>
            <strong>Notas:</strong> {localPatient.notes}
          </p>
        )}
      </section>

      {/* PRESCRIPTIONS */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          Recetas médicas
          <span className="text-sm text-slate-400">(últimas)</span>
        </h2>

        <PatientPrescriptionsList
          patientId={localPatient.id}
          prescriptions={localPatient.prescriptions ?? []}
          limit={2}
          onViewAll={onViewAllPrescriptions}
          onDeleted={handlePrescriptionDeleted}
        />
      </section>

      {/* DELETE MODAL */}
      <ConfirmModal
        open={showDeleteModal}
        loading={isDeleting}
        title="Eliminar paciente"
        description={`¿Seguro que deseas eliminar a ${localPatient.full_name}?`}
        confirmText="Eliminar paciente"
        cancelText="Cancelar"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePatient}
      />

    </div>
  );
}
