import React, { useCallback, useEffect, useReducer } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import api from "../api/axios";
import { compressImage, formatBytes } from "../utils/compressImage";

type Props = {
  open: boolean;
  onClose: () => void;
  patient: { id: number } | null;
  onUploaded: () => void;
};

type State = {
  description: string;
  notes: string;
  file: File | null;
  compressing: boolean;
  originalSize: number | null;
  compressedSize: number | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: any }
  | { type: "RESET" }
  | { type: "LOADING"; value: boolean }
  | { type: "COMPRESSING"; value: boolean }
  | { type: "SET_FILE"; file: File; originalSize: number; compressedSize: number }
  | { type: "ERROR"; value: string | null };

const initialState: State = {
  description: "",
  notes: "",
  file: null,
  compressing: false,
  originalSize: null,
  compressedSize: null,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "LOADING":
      return { ...state, loading: action.value };
    case "COMPRESSING":
      return { ...state, compressing: action.value };
    case "SET_FILE":
      return {
        ...state,
        file: action.file,
        originalSize: action.originalSize,
        compressedSize: action.compressedSize,
        compressing: false,
      };
    case "ERROR":
      return { ...state, error: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function UploadPrescriptionModal({
  open,
  onClose,
  patient,
  onUploaded,
}: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Reset cuando abre modal
  useEffect(() => {
    if (open) dispatch({ type: "RESET" });
  }, [open]);

  // ── Selección de archivo ───────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      dispatch({ type: "SET_FIELD",
          field: "file", value: null });
      dispatch({ type: "SET_FIELD",
          field: "originalSize", value: null });
      dispatch({ type: "SET_FIELD",
          field: "compressedSize", value: null });
      return;
    }

    // PDFs: no se comprimen, se usan directo
    if (file.type === "application/pdf") {
      dispatch({ type: "SET_FILE",
          file,
          originalSize: file.size,
          compressedSize: file.size });
      return;
    }

    // Imágenes: comprimir hasta 1 MB
    try {
      dispatch({ type: "COMPRESSING",
          value: true });
      dispatch({ type: "ERROR",
          value: null });

      const { file: compressed, originalSize, compressedSize } = await compressImage(file, {
        maxSizeBytes: 1 * 1024 * 1024, // 1 MB
      });

      dispatch({ type: "SET_FILE",
          file: compressed, originalSize, compressedSize });
    } catch (err) {
      console.error("❌ Error al comprimir imagen:", err);
      dispatch({ type: "ERROR", 
          value: "No se pudo comprimir la imagen. Intenta con otro archivo." });
      dispatch({ type: "COMPRESSING",
          value: false });
    }
  };

  // ── Validación ─────────────────────────────────────────────────────────
  const validate = () => {
    if (!state.description.trim()) return "El título es obligatorio";
    if (!state.file) return "Debe seleccionar un archivo";
    if (state.file.type === "application/pdf" && state.file.size > 5 * 1024 * 1024)
      return "El PDF debe pesar menos de 5 MB";
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const submit = useCallback(async () => {
    if (!patient) return;

    const validationError = validate();
    if (validationError) {
      dispatch({ type: "ERROR",
          value: validationError });
      return;
    }

    try {
      dispatch({ type: "LOADING",
          value: true });
      dispatch({ type: "ERROR",
          value: null });

      const formData = new FormData();
      formData.append("patient", String(patient.id));
      formData.append("description", state.description);
      formData.append("file", state.file!);
      formData.append("notes", state.notes);

      await api.post("/prescriptions/", formData);

      onUploaded();
      onClose();
    } catch (error) {
      dispatch({ type: "ERROR",
          value: "Error subiendo receta" });
    } finally {
      dispatch({ type: "LOADING",
          value: false });
    }
  }, [patient, state, onUploaded, onClose]);

  if (!patient) return null;

  const isPDF = state.file?.type === "application/pdf";
  const wasCompressed =
    !isPDF &&
    state.originalSize !== null &&
    state.compressedSize !== null &&
    state.originalSize !== state.compressedSize;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Subir receta médica</h2>

      {state.error && (
        <div className="text-red-500 mb-3">{state.error}</div>
      )}

      <Input
        label="Título"
        value={state.description}
        onChange={(e) =>
          dispatch({ type: "SET_FIELD",
              field: "description", value: e.target.value })
        }
      />

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Archivo</label>

        <input
          type="file"
          accept=".pdf,image/*"
          disabled={state.compressing}
          onChange={handleFileChange}
          className="disabled:opacity-50"
        />

        {/* Estado: comprimiendo */}
        {state.compressing && (
          <p className="text-xs text-slate-500 mt-1">Optimizando imagen...</p>
        )}

        {/* Estado: archivo listo */}
        {state.file && !state.compressing && (
          <p className="text-xs mt-1">
            {wasCompressed ? (
              <span className="text-emerald-600">
                ✓ {state.file.name} —{" "}
                <span className="line-through text-slate-400">
                  {formatBytes(state.originalSize!)}
                </span>{" "}
                → {formatBytes(state.compressedSize!)}
              </span>
            ) : (
              <span className="text-gray-500">
                {state.file.name} — {formatBytes(state.file.size)}
              </span>
            )}
          </p>
        )}
      </div>

      <Input
        label="Notas"
        value={state.notes}
        onChange={(e) =>
          dispatch({ type: "SET_FIELD",
              field: "notes",
              value: e.target.value })
        }
      />

      <Button onClick={submit} disabled={state.loading || state.compressing}>
        {state.loading ? "Subiendo..." : "Subir receta"}
      </Button>
    </Modal>
  );
}
