import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../api/axios";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();


  try {
    const res = await api.post("auth/login/", {
      email,
      password,
    });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    navigate("/patients");
  } catch (err) {
      if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Error del servidor. Intente más tarde.");
      }
        console.error("❌ login error", err);
  } finally {
    setLoading(false);
  }

};


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-slate-50">

      {/* Header */}
      <header className="flex flex-col items-center pt-10 px-4">
        <img
          src={logo}
          alt="FisioClinic"
          className="w-40 sm:w-48 mb-4"
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700">
          FisioClinic
        </h1>

        <p className="mt-1 text-center text-sm text-emerald-800/70">
          Centro de Terapia Física y Rehabilitación
        </p>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1 text-center">
            Iniciar sesión
          </h2>

          <p className="text-sm text-slate-500 text-center mb-6">
            Accede a tu cuenta
          </p>

                  {/* 🔴 ALERTA */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
            >
              {loading ? "Validando..." : "Entrar"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center text-sm text-slate-500">
            <Link
              to="/"
              className="text-emerald-600 hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        Recuperando el camino · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
