import React from "react";
import Button from "./Button";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Confirmar acción",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* MODAL */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">

        <h2 className="text-lg font-semibold text-slate-800">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-slate-600">
            {description}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">

          <Button
            onClick={onCancel}
            disabled={loading}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800"
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Procesando..." : confirmText}
          </Button>

        </div>
      </div>
    </div>
  );
}
