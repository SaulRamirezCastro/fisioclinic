import React from "react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../Button";
import {ClinicalHistoryForm} from "./ClinicalHistoryForm";

export default function PatientClinicalHistory({ patient }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [openForm, setOpenForm] = useState(false);

  const loadHistory = async () => {
    const res = await api.get("clinical-history/", {
      params: { patient: patient.id },
    });
    setItems(res.data);
  };

  useEffect(() => {
    loadHistory();
  }, [patient.id]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Historial clínico
        </h2>

        <Button onClick={() => setOpenForm(!openForm)}>
          + Nueva evolución
        </Button>
      </div>

      {openForm && (
        <ClinicalHistoryForm
          patientId={patient.id}
          onSaved={() => {
            setOpenForm(false);
            loadHistory();
          }}
        />
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-slate-500">
            Sin registros clínicos
          </p>
        )}

        {items.map((h) => (
          <div
            key={h.id}
            className="border-l-4 border-emerald-600 pl-4 bg-white rounded-xl shadow p-4"
          >
            <div className="text-sm text-slate-500 mb-1">
              {new Date(h.date).toLocaleDateString()} · {h.therapist_name}
            </div>

            <p><strong>Tratamiento:</strong> {h.treatment}</p>

            {h.diagnosis && (
              <p><strong>Diagnóstico:</strong> {h.diagnosis}</p>
            )}

            {h.evolution && (
              <p><strong>Evolución:</strong> {h.evolution}</p>
            )}

            {h.pain_level !== null && (
              <p><strong>Dolor:</strong> {h.pain_level}/10</p>
            )}

            {h.notes && (
              <p className="text-slate-600">
                {h.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
