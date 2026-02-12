import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../auth/useAuth";
import { ERROR_MESSAGES } from "../constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { login, loading, error: authError, clearError } = useAuth();

  // Combined error (validation or auth error)
  const error = validationError || authError;

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim()) {
      setValidationError(ERROR_MESSAGES.EMPTY_FIELDS);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError(ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear errors
    setValidationError(null);
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      // Navigation is handled by the hook
    } catch (err) {
      // Error is already set by the hook
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setValidationError(null);
      clearError();
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) {
      setValidationError(null);
      clearError();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-slate-50">
      {/* Header */}
      <header className="flex flex-col items-center pt-10 px-4">
        <img
          src={logo}
          alt="FisioClinic Logo"
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

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 flex items-start gap-2"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Formulario de inicio de sesión"
            noValidate
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading}
                autoComplete="email"
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
                className={`w-full rounded-xl border border-slate-300 px-4 py-2.5 
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
                  transition-colors`}
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  className={`w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-12
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
                    transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                tabIndex={loading ? -1 : 0}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-emerald-600 hover:bg-emerald-700 
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold py-2.5 rounded-xl 
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Validando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center text-sm text-slate-500">
            <Link
              to="/"
              className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              tabIndex={loading ? -1 : 0}
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