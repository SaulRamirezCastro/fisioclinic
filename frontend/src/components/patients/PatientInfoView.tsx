import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import PatientPrescriptionsList from "./PatientPrescriptions";
import ConfirmModal from "../ConfirmModal";
import api from "../../api/axios";
import { ROUTES, ERROR_MESSAGES } from "../../constants";

/* =======================
   TYPES
======================= */

interface Prescription {
  id: number;
  description?: string;
  file: string;
  created_at: string;
}

interface Patient {
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
  prescriptions?: Prescription[];
}

interface Props {
  patient: Patient;
  onEdit: () => void;
  onViewAllPrescriptions: () => void;
  onDeleted?: (patientId: number) => void;
}

/* =======================
   HELPERS
======================= */

const Empty = ({ text }: { text: string }) => (
  <span className="text-slate-400 italic">{text}</span>
);

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;

  try {
    const today = new Date();
    const birth = new Date(birthDate);

    // Validate date
    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const birthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());

    return birthdayPassed ? age : age - 1;
  } catch (error) {
    console.error("Error calculating age:", error);
    return null;
  }
}

/**
 * Format date to Spanish locale
 */
function formatDate(date?: string | null): string | null {
  if (!date) return null;

  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return null;

    return parsedDate.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
}

/**
 * Get initials from full name
 */
function getInitials(fullName: string): string {
  const names = fullName.trim().split(" ");
  if (names.length === 0) return "?";
  if (names.length === 1) return names[0].charAt(0).toUpperCase();

  // First name + Last name initials
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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

  const [localPatient, setLocalPatient] = useState<Patient>(patient);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const initials = useMemo(() => {
    return getInitials(localPatient.full_name);
  }, [localPatient.full_name]);

  const hasAddress = useMemo(() => {
    return !!(
      localPatient.street ||
      localPatient.neighborhood ||
      localPatient.city ||
      localPatient.state ||
      localPatient.postal_code
    );
  }, [localPatient]);

  const hasClinicalInfo = useMemo(() => {
    return !!(
      localPatient.chronic_diseases ||
      localPatient.recent_surgeries ||
      localPatient.diagnosis ||
      localPatient.notes
    );
  }, [localPatient]);

  /* -----------------------
     DELETE PATIENT
  ----------------------- */

  const handleDeletePatient = async () => {
    setDeleteError(null);

    try {
      setIsDeleting(true);

      await api.delete(`/patients/${localPatient.id}/`);

      setShowDeleteModal(false);

      // Notify parent component
      onDeleted?.(localPatient.id);

      // Navigate to patients list
      navigate(ROUTES.PATIENTS || "/patients", { replace: true });

    } catch (error: any) {
      console.error("Error deleting patient:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "No se pudo borrar el paciente. Intenta nuevamente.";

      setDeleteError(errorMessage);
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
        prev.prescriptions?.filter((p) => p.id !== deletedId) ?? [],
    }));
  };

  /* -----------------------
     CANCEL DELETE
  ----------------------- */

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button
          onClick={onEdit}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
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

        {/* Photo/Avatar */}
        <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-md shrink-0">
          {localPatient.photo ? (
            <img
              src={localPatient.photo_url}
              alt={localPatient.full_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-emerald-700 text-4xl font-bold">
              {initials}
            </span>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              {localPatient.full_name}
            </h1>

            {age !== null && (
              <p className="text-slate-600">
                {age} año{age !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow
              label="Fecha de nacimiento"
              value={formatDate(localPatient.birth_date)}
            />

            <InfoRow
              label="Email"
              value={localPatient.email}
              href={localPatient.email ? `mailto:${localPatient.email}` : undefined}
            />

            <InfoRow
              label="Teléfono"
              value={localPatient.phone}
              href={localPatient.phone ? `tel:${localPatient.phone}` : undefined}
            />

            <InfoRow
              label="Tel. alternativo"
              value={localPatient.phone_alt}
              href={localPatient.phone_alt ? `tel:${localPatient.phone_alt}` : undefined}
            />

            <InfoRow
              label="Contacto emergencia"
              value={localPatient.emergency_contact}
            />

            <InfoRow
              label="Recomendado por"
              value={localPatient.recommended_by}
            />
          </div>
        </div>
      </section>

      {/* ADDRESS */}
      {hasAddress && (
        <section>
          <details className="group">
            <summary className="cursor-pointer font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Dirección
            </summary>

            <div className="mt-4 pl-6 text-sm text-slate-600 space-y-2">
              {localPatient.street && (
                <p>
                  <strong className="text-slate-700">Calle:</strong>{" "}
                  {localPatient.street}
                </p>
              )}

              {localPatient.neighborhood && (
                <p>
                  <strong className="text-slate-700">Colonia:</strong>{" "}
                  {localPatient.neighborhood}
                </p>
              )}

              {localPatient.city && (
                <p>
                  <strong className="text-slate-700">Ciudad:</strong>{" "}
                  {localPatient.city}
                </p>
              )}

              {(localPatient.state || localPatient.postal_code) && (
                <p>
                  <strong className="text-slate-700">Estado/CP:</strong>{" "}
                  {[localPatient.state, localPatient.postal_code]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </details>
        </section>
      )}

      {/* CLINICAL INFO */}
      {hasClinicalInfo && (
        <section className="space-y-4">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-emerald-600">🏥</span>
            Información clínica
          </h2>

          <div className="space-y-3 text-sm">
            {localPatient.chronic_diseases && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700 mb-1">
                  Enfermedades crónicas
                </p>
                <p className="text-slate-600">{localPatient.chronic_diseases}</p>
              </div>
            )}

            {localPatient.recent_surgeries && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700 mb-1">
                  Operaciones recientes
                </p>
                <p className="text-slate-600">{localPatient.recent_surgeries}</p>
              </div>
            )}

            {localPatient.diagnosis && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-emerald-800 mb-1">
                  Diagnóstico
                </p>
                <p className="text-emerald-700">{localPatient.diagnosis}</p>
              </div>
            )}

            {localPatient.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-blue-800 mb-1">
                  Notas adicionales
                </p>
                <p className="text-blue-700">{localPatient.notes}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PRESCRIPTIONS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-emerald-600">📋</span>
          Recetas médicas
          <span className="text-sm text-slate-400 font-normal">(últimas)</span>
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
        description={
          <>
            <p className="mb-2">
              ¿Seguro que deseas eliminar a <strong>{localPatient.full_name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              Esta acción no se puede deshacer y se eliminarán todas las recetas asociadas.
            </p>
            {deleteError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}
          </>
        }
        confirmText="Eliminar paciente"
        cancelText="Cancelar"
        onCancel={handleCancelDelete}
        onConfirm={handleDeletePatient}
      />

    </div>
  );
}

/* =======================
   INFO ROW COMPONENT
======================= */

interface InfoRowProps {
  label: string;
  value?: string | null;
  href?: string;
}

function InfoRow({ label, value, href }: InfoRowProps) {
  if (!value) {
    return (
      <p className="text-slate-500">
        <strong className="text-slate-600">{label}:</strong>{" "}
        <Empty text="No registrado" />
      </p>
    );
  }

  if (href) {
    return (
      <p>
        <strong className="text-slate-600">{label}:</strong>{" "}
        <a
          href={href}
          className="text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          {value}
        </a>
      </p>
    );
  }

  return (
    <p>
      <strong className="text-slate-600">{label}:</strong>{" "}
      <span className="text-slate-800">{value}</span>
    </p>
  );
}
