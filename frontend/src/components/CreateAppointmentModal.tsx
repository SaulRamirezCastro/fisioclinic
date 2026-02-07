import { useEffect, useState } from "react";
import React from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import api from "../api/axios";

export default function CreateAppointmentModal({ open, onClose, onCreated }: any) {
  const [patients, setPatients] = useState<any[]>([]);
  const [patient, setPatient] = useState("");
  const [datetime, setDatetime] = useState("");
  const [status, setStatus] = useState("scheduled");

  useEffect(() => {
    api.get("patients/").then(res => {
      setPatients(
        res.data.map((p: any) => ({
          value: p.id,
          label: p.full_name,
        }))
      );
    });
  }, []);

  const submit = async () => {
    await api.post("appointments/", {
      patient,
      datetime,
      status,
    });
    onCreated();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg mb-4">Nueva cita</h2>

      <Select
        label="Paciente"
        value={patient}
        onChange={e => setPatient(e.target.value)}
        options={patients}
      />

      <Input
        label="Fecha y hora"
        type="datetime-local"
        value={datetime}
        onChange={e => setDatetime(e.target.value)}
      />

      <Select
        label="Estado"
        value={status}
        onChange={e => setStatus(e.target.value)}
        options={[
          { value: "scheduled", label: "Programada" },
          { value: "done", label: "Asistió" },
          { value: "cancelled", label: "Cancelada" },
        ]}
      />

      <Button onClick={submit}>Guardar cita</Button>
    </Modal>
  );
}
