import { useState, useEffect } from "react";
import Button from "../Button";
import React from "react";
import api from "../../api/axios";
import ConfirmModal from "../ConfirmModal";

type Props = {
  patientId: number;
  prescriptions: any[];
  limit?: number;
  onViewAll?: () => void;
  onDeleted?: (prescriptionId: number) => void;
};

export default function PatientPrescriptionsList({
  patientId,
  prescriptions = [],
  limit,
  onViewAll,
  onDeleted,
}: Props) {

  /* ---------------- LOCAL STATE ---------------- */

  const [localPrescriptions, setLocalPrescriptions] =
    useState(prescriptions);

  const [previewPrescription, setPreviewPrescription] =
    useState<any | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [confirmDeleteTarget, setConfirmDeleteTarget] =
    useState<any | null>(null);

  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(
    new Set()
  );

  /* ---------------- SYNC PROPS ---------------- */

  useEffect(() => {
    setLocalPrescriptions(prescriptions);
  }, [prescriptions]);

  /* ---------------- DERIVED ---------------- */

  const items = limit
    ? localPrescriptions.slice(0, limit)
    : localPrescriptions;

  if (!localPrescriptions.length) {
    return (
      <p className="text-sm text-slate-500">
        No hay recetas registradas
      </p>
    );
  }

  /* ---------------- HELPERS ---------------- */

  const toggleNotes = (id: number) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ---------------- API DELETE ---------------- */

  const deletePatientPrescription = async (prescriptionId: number) => {
    await api.delete(
      `/patients/${patientId}/prescriptions/${prescriptionId}/`
    );
  };

  /* ---------------- DELETE HANDLER ---------------- */

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return;

    try {
      setDeletingId(confirmDeleteTarget.id);

      await deletePatientPrescription(confirmDeleteTarget.id);

      setLocalPrescriptions((prev) =>
        prev.filter((p) => p.id !== confirmDeleteTarget.id)
      );

      if (previewPrescription?.id === confirmDeleteTarget.id) {
        setPreviewPrescription(null);
      }

      onDeleted?.(confirmDeleteTarget.id);
    } catch (error) {
      console.error("Error al borrar receta", error);
      alert("No se pudo borrar la receta");
    } finally {
      setDeletingId(null);
      setConfirmDeleteTarget(null);
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* LISTA */}
      <div className="space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="border rounded-lg overflow-hidden"
          >
            {/* Fila principal */}
            <div className="flex justify-between items-center p-3">
              <div>
                <p className="font-medium text-slate-800">
                  {r.description || "Receta médica"}
                </p>

                <p className="text-xs text-slate-500">
                  {new Date(r.created_at).toLocaleDateString("es-MX")}
                </p>
              </div>

              <div className="flex gap-2">
                {/* NOTAS — solo si existen */}
                {r.notes && (
                  <Button
                    variant="secondary"
                    onClick={() => toggleNotes(r.id)}
                  >
                    {expandedNotes.has(r.id) ? "Ocultar notas" : "Ver notas"}
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={() => setPreviewPrescription(r)}
                  disabled={deletingId === r.id}
                >
                  Ver archivo
                </Button>

                <Button
                  variant="danger"
                  onClick={() => setConfirmDeleteTarget(r)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? "Borrando…" : "🗑 Borrar"}
                </Button>
              </div>
            </div>

            {/* Panel de notas expandible */}
            {r.notes && expandedNotes.has(r.id) && (
              <div className="px-4 pb-4 pt-1 bg-slate-50 border-t text-sm text-slate-700 whitespace-pre-wrap">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Notas
                </p>
                {r.notes}
              </div>
            )}
          </div>
        ))}

        {onViewAll && localPrescriptions.length > items.length && (
          <div className="pt-2">
            <Button variant="secondary" onClick={onViewAll}>
              Ver todas las recetas
            </Button>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewPrescription && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] relative overflow-hidden">

            <div className="flex justify-between items-center px-6 py-3 border-b">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {previewPrescription.description || "Receta médica"}
                </h3>

                <p className="text-xs text-slate-500">
                  {new Date(
                    previewPrescription.created_at
                  ).toLocaleDateString("es-MX")}
                </p>

                {/* Notas en el modal de preview */}
                {previewPrescription.notes && (
                  <p className="text-xs text-slate-600 mt-1 max-w-lg line-clamp-2">
                    {previewPrescription.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() =>
                    setConfirmDeleteTarget(previewPrescription)
                  }
                  disabled={deletingId === previewPrescription.id}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  {deletingId === previewPrescription.id
                    ? "Borrando…"
                    : "🗑 Borrar"}
                </button>

                <button
                  onClick={() => setPreviewPrescription(null)}
                  className="text-slate-500 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="w-full h-[calc(85vh-64px)]">
              {previewPrescription.file
                ?.toLowerCase()
                .includes(".pdf") ? (
                <iframe
                  src={previewPrescription.file}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <img
                    src={previewPrescription.file}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirmDeleteTarget}
        loading={deletingId === confirmDeleteTarget?.id}
        title="Eliminar receta"
        description={`¿Seguro que deseas eliminar la receta "${
          confirmDeleteTarget?.description || "Receta médica"
        }"?`}
        confirmText="Eliminar receta"
        cancelText="Cancelar"
        onCancel={() => setConfirmDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}