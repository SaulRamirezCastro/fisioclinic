import { useEffect, useState } from "react";
import React from "react";
import api from "../api/axios";
import SearchInput from "../components/SearchInput";
import Button from "../components/Button";

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      api
        .get(`appointments/?search=${search}`)
        .then((res) => setAppointments(res.data));
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl">Citas</h1>
        <Button>+ Nueva cita</Button>
      </div>

      <SearchInput
        placeholder="Buscar por paciente o doctor"
        value={search}
        onChange={setSearch}
      />

      <div className="bg-white shadow rounded mt-4">
        {appointments.map((a) => (
          <div key={a.id} className="p-3 border-b">
            <div className="font-medium">
              Paciente: {a.patient}
            </div>
            <div className="text-sm text-gray-600">
              Doctor: {a.therapist}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(a.datetime).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
