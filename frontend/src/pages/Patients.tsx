import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import React from "react";
import Sidebar from "../components/Sidebar";
import { logout } from "../auth/logout";

import SearchInput from "../components/SearchInput";
import CreatePatientView from "../components/patients/CreatePatientView";
import EditPatientForm from "../components/patients/EditPatientForm";
import UploadPrescriptionModal from "../components/UploadPrescriptionModal";
import PatientCalendar from "../components/patients/PatientAppointmentsCalendar";
import PatientReport from "../components/patients/PatientReport";
import PatientInfoView from "../components/patients/PatientInfoView";
import PatientClinicalHistory from "../components/patients/PatientClinicalHistory";
import PatientPrescriptionsList from "../components/patients/PatientPrescriptions";
import AppointmentsCalendarView from "../components/agenda/AppointmentsCalendarView";
import PatientCard from "../components/patients/PatientCard";

/* =======================
   TYPES
======================= */

type Patient = {
  id: number;
  full_name: string;
  prescriptions?: any[];
};

type View = "list" | "detail" | "calendar" | "create";

type PatientTab =
  | "info"
  | "appointments"
  | "prescriptions"
  | "report"
  | "history";

/* =======================
   COMPONENT
======================= */

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("list");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [activeTab, setActiveTab] = useState<PatientTab>("info");
  const [editMode, setEditMode] = useState(false);

  const [openUploadPrescription, setOpenUploadPrescription] =
    useState(false);

  /* =======================
     DATA FETCHING
  ======================= */

  const loadPatients = useCallback(async () => {
    const res = await api.get("patients/", {
      params: { search },
    });
    setPatients(res.data);
  }, [search]);

  const loadCalendarAppointments = useCallback(
    async (start?: string, end?: string) => {
      const res = await api.get("/appointments/calendar/", {
        params: { start, end },
      });
      return res.data;
    },
    []
  );

  /* =======================
     EFFECTS
  ======================= */

  // Debounced search + initial load
  useEffect(() => {
    const delay = setTimeout(loadPatients, 300);
    return () => clearTimeout(delay);
  }, [loadPatients]);

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">
      {/* ===== SIDEBAR ===== */}
      <Sidebar>
        <button
          onClick={() => {
            setView("create");
            setSelectedPatient(null);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition"
        >
          + Nuevo paciente
        </button>

        <button
          onClick={() => {
            setView("list");
            setSelectedPatient(null);
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition"
        >
          Pacientes
        </button>

        <button
          onClick={() => {
            setView("calendar");
            setSelectedPatient(null);
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition"
        >
          📅 Agenda
        </button>

        <div className="mt-auto pt-4 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition"
          >
            Cerrar sesión
          </button>
        </div>
      </Sidebar>

      {/* ===== MAIN ===== */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* ================= LIST ================= */}
        {view === "list" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-slate-800">
                Pacientes
              </h1>
            </div>

            <div className="flex gap-2 mb-4">
              <SearchInput
                placeholder="Buscar por nombre del Paciente o Doctor"
                value={search}
                onChange={setSearch}
              />
            </div>

            <div className="bg-white shadow rounded-xl">
              {patients.length === 0 && (
                <div className="p-6 text-sm text-gray-500 text-center">
                  No hay pacientes registrados en la ult
                </div>
              )}

              <div className="space-y-2">
                {patients.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    onOpen={() => {
                      setSelectedPatient(p);
                      setActiveTab("info");
                      setView("detail");
                    }}
                    onPrescription={() => {
                      setSelectedPatient(p);
                      setOpenUploadPrescription(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= CREATE ================= */}
        {view === "create" && (
          <CreatePatientView
            onCancel={() => setView("list")}
            onCreated={(newPatient) => {
              loadPatients();
              setSelectedPatient(newPatient);
              setView("list");
            }}
          />
        )}

        {/* ================= DETAIL ================= */}
        {view === "detail" && selectedPatient && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  setView("list");
                  setEditMode(false);
                }}
                className="text-sm text-slate-600 hover:underline"
              >
                ← Volver
              </button>

              <h1 className="text-2xl font-semibold text-slate-800">
                {selectedPatient.full_name}
              </h1>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6 flex gap-8">
              {[
                ["info", "Información"],
                ["appointments", "Citas"],
                ["prescriptions", "Recetas"],
                ["report", "Generar Reporte"],
                ["history", "Historial clínico"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key as PatientTab);
                    setEditMode(false);
                  }}
                  className={`pb-2 font-medium ${
                    activeTab === key
                      ? "border-b-2 border-emerald-600 text-emerald-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === "info" &&
              (!editMode ? (
                <PatientInfoView
                  patient={selectedPatient}
                  onEdit={() => setEditMode(true)}
                  onViewAllPrescriptions={() => setActiveTab("prescriptions")}
                  onDeleted={() => {
                    setSelectedPatient(null);
                    setView("list");
                    loadPatients();
                  }}
                />
              ) : (
                <EditPatientForm
                  patient={selectedPatient}
                  onCancel={() => setEditMode(false)}
                  onSaved={(updated) => {
                    setSelectedPatient(updated);
                    loadPatients();
                    setEditMode(false);
                  }}
                />
              ))}

            {activeTab === "appointments" && (
              <div className="bg-white rounded-2xl shadow p-6">
                <PatientCalendar patientId={selectedPatient.id} />
              </div>
            )}

            {activeTab === "prescriptions" && (
              <div className="bg-white rounded-2xl shadow p-6">
                <PatientPrescriptionsList
                  patientId={selectedPatient.id}
                  prescriptions={selectedPatient.prescriptions || []}
                />
              </div>
            )}

            {activeTab === "report" && (
              <div className="bg-white rounded-2xl shadow p-6">
                <PatientReport patient={selectedPatient} />
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white rounded-2xl shadow p-6">
                <PatientClinicalHistory patient={selectedPatient} />
              </div>
            )}
          </>
        )}

        {/* ================= CALENDAR ================= */}
        {view === "calendar" && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setView("list")}
                className="text-sm text-slate-600 hover:underline"
              >
                ← Volver
              </button>

              <h1 className="text-2xl font-semibold text-slate-800">
                Agenda de citas
              </h1>
            </div>

            <AppointmentsCalendarView loadCalendarAppointments={loadCalendarAppointments} />
          </>
        )}

    </main>


{/* ===== MODALES ===== */
}


        <UploadPrescriptionModal
            open={openUploadPrescription}
            onClose={() => setOpenUploadPrescription(false)}
            patient={selectedPatient}
            onUploaded={loadPatients}
        />
    </div>
);

}
