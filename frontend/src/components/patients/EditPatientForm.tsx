import { useState } from "react";
import React from "react";
import Button from "../Button";
import api from "../../api/axios";
import { compressImage, formatBytes } from "../../utils/compressImage";

export default function EditPatientForm({
  patient,
  onCancel,
  onSaved,
}: any) {
  const [form, setForm] = useState({ ...patient });
  const [loading, setLoading] = useState(false);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [photoSize, setPhotoSize] = useState<{
    original: number;
    compressed: number;
  } | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Selección y compresión de foto ──────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setNewPhoto(null);
      setPhotoPreview(null);
      setPhotoSize(null);
      return;
    }

    try {
      setCompressing(true);
      setError(null);

      const { file: compressed, originalSize, compressedSize } = await compressImage(file, {
        maxSizeBytes: 1 * 1024 * 1024, // 1 MB
      });

      setPhotoSize({ original: originalSize, compressed: compressedSize });
      setNewPhoto(compressed);

      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("❌ Error al comprimir imagen:", err);
      setError("No se pudo comprimir la imagen. Intenta con otra foto.");
    } finally {
      setCompressing(false);
    }
  };

  // ── Guardar ─────────────────────────────────────────────────────────────
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

      const res = await api.patch(`patients/${patient.id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved(res.data);
      setForm(res.data);
      setPhotoPreview(null);
      setNewPhoto(null);
      setPhotoSize(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar foto ────────────────────────────────────────────────────────
  const handleDeletePhoto = async () => {
    if (!confirm("¿Eliminar la foto del paciente?")) return;

    try {
      setDeletingPhoto(true);
      setError(null);

      await api.delete(`patients/${patient.id}/delete_photo/`);

      setForm({ ...form, photo: null });
      setNewPhoto(null);
      setPhotoPreview(null);
      setPhotoSize(null);
    } catch (err: any) {
      console.error("❌ Error al eliminar foto:", err);

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Error al eliminar la foto";

      setError(errorMessage);
    } finally {
      setDeletingPhoto(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Editar información del paciente</h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FOTO DEL PACIENTE */}
      <section className="space-y-2">
        <h3 className="font-semibold">Foto del paciente</h3>

        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center shadow-md relative">
            {compressing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl z-10">
                <span className="text-white text-xs font-medium">
                  Optimizando...
                </span>
              </div>
            )}
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview de foto"
                className="w-full h-full object-cover"
              />
            ) : form.photo ? (
              <img
                src={form.photo}
                alt="Foto del paciente"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400 text-sm">Sin foto</span>
            )}
          </div>

          {/* Controles */}
          <div className="space-y-2">
            {/* CAMBIAR / AGREGAR */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {newPhoto ? "Cambiar foto" : "Agregar foto"}
              </label>
              <input
                type="file"
                accept="image/*"
                disabled={compressing}
                onChange={handlePhotoChange}
                className="text-sm disabled:opacity-50"
              />

              {/* Feedback de compresión */}
              {newPhoto && photoSize && (
                <p className="text-xs text-emerald-600 mt-1">
                  ✓ {newPhoto.name} —{" "}
                  <span className="line-through text-slate-400">
                    {formatBytes(photoSize.original)}
                  </span>{" "}
                  → {formatBytes(photoSize.compressed)}
                </p>
              )}

              {compressing && (
                <p className="text-xs text-slate-500 mt-1">
                  Optimizando imagen...
                </p>
              )}
            </div>

            {/* ELIMINAR foto existente */}
            {form.photo && !newPhoto && (
              <Button
                variant="danger"
                onClick={handleDeletePhoto}
                disabled={deletingPhoto}
              >
                {deletingPhoto ? "Eliminando..." : "Eliminar foto"}
              </Button>
            )}

            {/* CANCELAR nueva foto */}
            {newPhoto && (
              <Button
                variant="secondary"
                onClick={() => {
                  setNewPhoto(null);
                  setPhotoPreview(null);
                  setPhotoSize(null);
                }}
              >
                Cancelar cambio de foto
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Datos generales */}
      <h2 className="font-semibold mb-2">Datos generales</h2>

      <input
        name="full_name"
        value={form.full_name || ""}
        onChange={handleChange}
        className="input"
        placeholder="Nombre completo"
        required
      />

      <input
        name="birth_date"
        type="date"
        value={form.birth_date || ""}
        onChange={handleChange}
        className="input"
      />

      <input
        name="email"
        value={form.email || ""}
        onChange={handleChange}
        className="input"
        placeholder="Email"
        type="email"
      />

      <input
        name="phone"
        value={form.phone || ""}
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
      <h2 className="font-semibold mb-2 mt-4">Dirección</h2>

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

      {/* Información Clínica */}
      <h2 className="font-semibold mb-2 mt-4">Información Clínica</h2>

      <textarea
        name="diagnosis"
        value={form.diagnosis || ""}
        onChange={handleChange}
        className="input h-24"
        placeholder="Diagnóstico / Padecimiento"
      />

      <textarea
        name="chronic_diseases"
        value={form.chronic_diseases || ""}
        onChange={handleChange}
        className="input h-24"
        placeholder="Enfermedades Crónicas"
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
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={save} disabled={loading || compressing}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}