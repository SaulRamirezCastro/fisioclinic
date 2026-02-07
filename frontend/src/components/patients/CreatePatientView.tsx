import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import api from "../../api/axios";

type Props = {
  onCancel: () => void;
  onCreated: (patient: any) => void;
};

export default function CreatePatientView({ onCancel, onCreated }: Props) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    phone_alt: "",
    email: "",
    emergency_contact: "",
    street: "",
    neighborhood: "",
    city: "",
    state: "",
    postal_code: "",
    diagnosis: "",
    notes: "",
    recommended_by: "",
    chronic_diseases: "",
    recent_surgeries: "",
  });

  const [birthDate, setBirthDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ---------------- VALIDATION ---------------- */

  const errors = {
    full_name: !form.full_name ? "Nombre obligatorio" : "",
    phone: !form.phone ? "Teléfono obligatorio" : "",
  };

  const hasErrors = Object.values(errors).some(Boolean);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const markTouched = (name: string) =>
    setTouched(prev => ({ ...prev, [name]: true }));

  /* ---------------- FOTO PREVIEW ---------------- */

  const previewUrl = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  /* ---------------- AGE ---------------- */

  function calculateAge(date?: string) {
    if (!date) return null;
    const today = new Date();
    const birth = new Date(date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  const age = calculateAge(birthDate);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (hasErrors) return;

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(form).forEach(([k, v]) => data.append(k, v));

      if (birthDate) data.append("birth_date", birthDate);
      if (photo) data.append("photo", photo);

      const res = await api.post("patients/", data);

      onCreated(res.data);
      navigate("/patients", { state: { created: true } });

    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Registrar nuevo paciente</h1>
        <p className="text-sm text-slate-500">
          Los campos con * son obligatorios
        </p>
      </header>

      {/* ---------------- DATOS GENERALES ---------------- */}

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-700">Datos generales</h3>

        <div className="grid md:grid-cols-[auto_1fr] gap-5">
          {/* FOTO */}
          <div className="flex flex-col items-center">
            <label htmlFor="photo" className="cursor-pointer">
              <input
                id="photo"
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />

              <div className="w-28 aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400 text-xs">📷 Foto</span>
                )}
              </div>
            </label>
          </div>

          {/* NOMBRE */}
          <div className="space-y-4">

            <div>
              <label htmlFor="full_name" className="label">
                Nombre completo *
              </label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                onBlur={() => markTouched("full_name")}
                className="input w-full"
              />
              {touched.full_name && errors.full_name && (
                <p className="text-xs text-red-500">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="birth_date" className="label">
                Fecha nacimiento
              </label>
              <input
                id="birth_date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input w-full"
              />
              {age !== null && (
                <p className="text-sm text-slate-600">
                  Edad: <strong>{age} años</strong>
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- CONTACTO ---------------- */}

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-700">Contacto</h3>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label htmlFor="phone" className="label">Teléfono *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              onBlur={() => markTouched("phone")}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="phone_alt" className="label">
              Teléfono alternativo
            </label>
            <input
              id="phone_alt"
              name="phone_alt"
              type="tel"
              value={form.phone_alt}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="label">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="emergency_contact" className="label">
              Contacto emergencia
            </label>
            <input
              id="emergency_contact"
              name="emergency_contact"
              value={form.emergency_contact}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

        </div>
      </section>

      {/* ---------------- DIRECCIÓN ---------------- */}

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-700">Dirección</h3>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label htmlFor="street" className="label">Calle</label>
            <input
              id="street"
              name="street"
              value={form.street}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="neighborhood" className="label">Colonia</label>
            <input
              id="neighborhood"
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="city" className="label">Ciudad</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="state" className="label">Estado</label>
            <input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="postal_code" className="label">
              Código postal
            </label>
            <input
              id="postal_code"
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

        </div>
      </section>

      {/* ---------------- CLÍNICO ---------------- */}

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-700">
          Información clínica
        </h3>

        <div className="space-y-3">

          <div>
            <label htmlFor="recommended_by" className="label">
              Recomendado por
            </label>
            <input
              id="recommended_by"
              name="recommended_by"
              value={form.recommended_by}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="chronic_diseases" className="label">
              Enfermedades crónicas
            </label>
            <textarea
              id="chronic_diseases"
              name="chronic_diseases"
              value={form.chronic_diseases}
              onChange={handleChange}
              className="input h-20"
            />
          </div>

          <div>
            <label htmlFor="recent_surgeries" className="label">
              Operaciones recientes
            </label>
            <textarea
              id="recent_surgeries"
              name="recent_surgeries"
              value={form.recent_surgeries}
              onChange={handleChange}
              className="input h-20"
            />
          </div>

          <div>
            <label htmlFor="diagnosis" className="label">
              Diagnóstico
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              className="input h-24"
            />
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Observaciones
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input h-20"
            />
          </div>

        </div>
      </section>

      {/* ---------------- ACTIONS ---------------- */}

      <footer className="border-t pt-5 flex justify-between">
        <span className="text-sm text-slate-500">
          Podrás editar después
        </span>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || hasErrors}
          >
            {loading ? "Guardando..." : "Crear ficha"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
