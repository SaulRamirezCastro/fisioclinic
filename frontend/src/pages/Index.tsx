import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">

        {/* Logo */}
        <img
          src={logo}
          alt="FisioClinic"
          className="mx-auto mb-6 w-48 sm:w-56"
        />

        {/* Title */}
        <h1 className="text-2xl font-bold text-emerald-700">
          FisioClinic
        </h1>

        <p className="mt-1 mb-6 text-sm text-slate-500">
          Centro de Terapia Física y Rehabilitación
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition"
          >
            Iniciar sesión
          </Link>

        </div>

        {/* Footer text */}
        <p className="mt-6 text-xs text-slate-400">
          Recuperando el camino · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
