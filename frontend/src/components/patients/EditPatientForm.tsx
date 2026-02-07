import { useState } from "react";
import React from "react";
import Button from "../Button";
import api from "../../api/axios";

export default function EditPatientForm({
  patient,
  onCancel,
  onSaved,
}: any) {
  const [form, setForm] = useState({ ...patient });
  const [loading, setLoading] = useState(false);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);


  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {
      try {
        setLoading(true);

        const data = new FormData();

        Object.entries(form).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== "photo") {
            data.append(key, value as any);
          }
        });

        if (newPhoto) {
          data.append("photo", newPhoto);
        }

        const res = await api.patch(
          `patients/${patient.id}/`,
          data
        );

        onSaved(res.data);
        setForm(res.data);
        setPhotoPreview(null);
        setNewPhoto(null);
      } finally {
        setLoading(false);
      }
    };

  const handleDeletePhoto = async () => {
      if (!confirm("¿Eliminar la foto del paciente?")) return;

      try {
        setDeletingPhoto(true);

        await api.delete(`patients/${patient.id}/delete_photo/`);

        setForm({ ...form, photo: null });
        setNewPhoto(null);
        setPhotoPreview(null);
      } finally {
        setDeletingPhoto(false);
      }
    };


  return (
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

          <h2 className="text-lg font-semibold">
              Editar información del paciente
          </h2>
          {/* FOTO DEL PACIENTE */}
          <section className="space-y-2">
              <h3 className="font-semibold">Foto del paciente</h3>

              <div className="flex items-center gap-4">
                  <div
                      className="w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center shadow-md">

                      {photoPreview ? (
                          <img src={photoPreview} alt="Preview de foto" className="w-full h-full object-cover"/>
                      ) : form.photo ? (
                          <img src={form.photo} alt="Foto del paciente" className="w-full h-full object-cover"/>
                      ) : (
                          <span className="text-slate-400 text-sm">
                            Sin foto
                        </span>
                      )}
                  </div>

                  <div className="space-y-2">
                      {/* CAMBIAR */}
                      <input type="file" accept="image/*"
                             onChange={(e) => {
                                 const file = e.target.files?.[0] || null;
                                 setNewPhoto(file);

                                 if (file) {
                                     const reader = new FileReader();
                                     reader.onloadend = () => {
                                         setPhotoPreview(reader.result as string);
                                     };
                                     reader.readAsDataURL(file);
                                 } else {
                                     setPhotoPreview(null);
                                 }
                             }}
                      />
                      {/* ELIMINAR */}
                      {form.photo && (
                          <Button variant="danger" onClick={handleDeletePhoto} disabled={deletingPhoto}>
                              Eliminar foto
                          </Button>
                      )}
                  </div>
              </div>
          </section>


          {/* Datos generales */}
          <h2 className="font-semibold mb-2">
              Datos generales
          </h2>
          <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="input"
              placeholder="Nombre completo"
          />

          <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              className="input"
              placeholder="Email"
          />

          <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input"
              placeholder="Teléfono"
          />

          <input
              name="phone_alt"
              value={form.phone_alt || ""}
              onChange={handleChange}
              className="input"
              placeholder="Teléfono alternativo"
          />

          <input
              name="emergency_contact"
              value={form.emergency_contact || ""}
              onChange={handleChange}
              className="input"
              placeholder="Contacto de emergencia"
          />

          <input
              name="recommended_by"
              value={form.recommended_by || ""}
              onChange={handleChange}
              className="input"
              placeholder="Recomendado por"
          />

          {/* Dirección */}
          <h2 className="font-semibold mb-2">
              Dirección
          </h2>
          <input
              name="street"
              value={form.street || ""}
              onChange={handleChange}
              className="input"
              placeholder="Calle"
          />

          <input
              name="neighborhood"
              value={form.neighborhood || ""}
              onChange={handleChange}
              className="input"
              placeholder="Colonia"
          />

          <div className="grid grid-cols-2 gap-2">
              <input
                  name="city"
                  value={form.city || ""}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ciudad"
              />
              <input
                  name="state"
                  value={form.state || ""}
                  onChange={handleChange}
                  className="input"
                  placeholder="Estado"
              />
          </div>

          <input
              name="postal_code"
              value={form.postal_code || ""}
              onChange={handleChange}
              className="input"
              placeholder="Código postal"
          />

          {/* Clínica */}
          <h2 className="font-semibold mb-2">
              Informacion Clinica
          </h2>
          <textarea
              name="diagnosis"
              value={form.diagnosis || ""}
              onChange={handleChange}
              className="input h-24"
              placeholder="Padecimiento"
          />

          <textarea
              name="chronic_diseases"
              value={form.chronic_diseases || ""}
              onChange={handleChange}
              className="input h-24"
              placeholder="Enfermedades Cronicas"
          />
          <textarea
              name="recent_surgeries"
              value={form.recent_surgeries || ""}
              onChange={handleChange}
              className="input h-24"
              placeholder="Operaciones Recientes"
          />
          <textarea
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              className="input h-24"
              placeholder="Notas clínicas"
          />

          {/* Acciones */}
          <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onCancel}>
                  Cancelar
              </Button>
              <Button onClick={save} disabled={loading}>
                  Guardar cambios
              </Button>
          </div>
      </div>
  );
}
