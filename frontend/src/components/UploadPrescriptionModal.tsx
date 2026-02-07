import React, { useCallback, useEffect, useReducer } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import api from "../api/axios";

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
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: any }
  | { type: "RESET" }
  | { type: "LOADING"; value: boolean }
  | { type: "ERROR"; value: string | null };

const initialState: State = {
  description: "",
  notes: "",
  file: null,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "LOADING":
      return { ...state, loading: action.value };
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

  const validate = () => {
    if (!state.description.trim())
      return "El título es obligatorio";

    if (!state.file)
      return "Debe seleccionar un archivo";

    if (state.file.size > 5 * 1024 * 1024)
      return "Archivo máximo 5MB";

    return null;
  };

  const submit = useCallback(async () => {
    if (!patient) return;

    const validationError = validate();
    if (validationError) {
      dispatch({ type: "ERROR", value: validationError });
      return;
    }

    try {
      dispatch({ type: "LOADING", value: true });
      dispatch({ type: "ERROR", value: null });

      const formData = new FormData();
      formData.append("patient", String(patient.id));
      formData.append("description", state.description);
      formData.append("file", state.file!);
      formData.append("notes", state.notes);

      await api.post("/prescriptions/", formData);

      onUploaded();
      onClose();
    } catch (error) {
      dispatch({
        type: "ERROR",
        value: "Error subiendo receta",
      });
    } finally {
      dispatch({ type: "LOADING", value: false });
    }
  }, [patient, state, onUploaded, onClose]);

  if (!patient) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        Subir receta médica
      </h2>

      {state.error && (
        <div className="text-red-500 mb-3">
          {state.error}
        </div>
      )}

      <Input
        label="Título"
        value={state.description}
        onChange={(e) =>
          dispatch({
            type: "SET_FIELD",
            field: "description",
            value: e.target.value,
          })
        }
      />

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Archivo
        </label>

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "file",
              value: e.target.files?.[0] || null,
            })
          }
        />

        {state.file && (
          <p className="text-xs text-gray-500 mt-1">
            {state.file.name}
          </p>
        )}
      </div>

      <Input
        label="Notas"
        value={state.notes}
        onChange={(e) =>
          dispatch({
            type: "SET_FIELD",
            field: "notes",
            value: e.target.value,
          })
        }
      />

      <Button
        onClick={submit}
        disabled={state.loading}
      >
        {state.loading ? "Subiendo..." : "Subir receta"}
      </Button>
    </Modal>
  );
}
