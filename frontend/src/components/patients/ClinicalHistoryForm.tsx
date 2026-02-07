import React, { useState } from "react";
import api from "../../api/axios";
import Button from "../Button";

/* ===================== TYPES ===================== */

type ClinicalHistoryFormData = {
  treatment: string;
  diagnosis: string;
  evolution: string;
  pain_level: number | null;
  notes: string;
};

type ClinicalHistoryFormProps = {
  patientId: number;
  onSaved: () => void;
};

/* ===================== COMPONENT ===================== */

export function ClinicalHistoryForm({
  patientId,
  onSaved,
}: ClinicalHistoryFormProps) {
  const [form, setForm] = useState<ClinicalHistoryFormData>({
    treatment: "",
    diagnosis: "",
    evolution: "",
    pain_level: null,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ===================== HANDLERS ===================== */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pain_level"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  const isValid =
    form.treatment.trim() ||
    form.diagnosis.trim() ||
    form.evolution.trim();

  const save = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setError(null);

      await api.post("clinical-history/", {
        ...form,
        patient: patientId,
      });

      // Reset opcional
      setForm({
        treatment: "",
        diagnosis: "",
        evolution: "",
        pain_level: null,
        notes: "",
      });

      onSaved();
    } catch (err) {
      setError("Error al guardar la historia clínica");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">
        Nueva evolución clínica
      </h2>

      {/* Evaluación clínica */}
      <section className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600">
            Diagnóstico
          </label>
          <textarea
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            placeholder="Diagnóstico del paciente"
            className="input"
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Tratamiento aplicado
          </label>
          <textarea
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            placeholder="Tratamiento realizado"
            className="input"
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Evolución
          </label>
          <textarea
            name="evolution"
            value={form.evolution}
            onChange={handleChange}
            placeholder="Evolución del paciente"
            className="input"
            rows={3}
          />
        </div>
      </section>

      {/* Dolor */}
      <section>
        <label className="text-xs font-medium text-slate-600">
          Nivel de dolor (0–10)
        </label>
        <input
          type="number"
          name="pain_level"
          min={0}
          max={10}
          value={form.pain_level ?? ""}
          onChange={handleChange}
          placeholder="0 a 10"
          className="input"
        />
      </section>

      {/* Notas */}
      <section>
        <label className="text-xs font-medium text-slate-600">
          Notas adicionales
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Observaciones adicionales"
          className="input"
          rows={3}
        />
      </section>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={save} disabled={!isValid || loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
