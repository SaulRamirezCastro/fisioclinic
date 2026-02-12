// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "auth/login/",
  LOGOUT: "auth/logout/",
  REFRESH: "auth/refresh/",
  FORGOT_PASSWORD: "auth/forgot-password/",
  RESET_PASSWORD: "auth/reset-password/",
  
  // Add other endpoints as needed
  // PATIENTS: "patients/",
  // APPOINTMENTS: "appointments/",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Validation Errors
  EMPTY_FIELDS: "Por favor completa todos los campos",
  INVALID_EMAIL: "Por favor ingresa un correo válido",
  PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres",
  PASSWORDS_DONT_MATCH: "Las contraseñas no coinciden",
  
  // Auth Errors
  INVALID_CREDENTIALS: "Usuario o contraseña incorrectos",
  UNAUTHORIZED: "No tienes autorización para realizar esta acción",
  SESSION_EXPIRED: "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
  
  // Server Errors
  SERVER_ERROR: "Error del servidor. Intente más tarde.",
  NETWORK_ERROR: "Error de conexión. Verifica tu internet.",
  TIMEOUT_ERROR: "La solicitud tardó demasiado. Intenta nuevamente.",
  
  // Generic
  UNKNOWN_ERROR: "Ha ocurrido un error inesperado",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Inicio de sesión exitoso",
  LOGOUT_SUCCESS: "Sesión cerrada exitosamente",
  PASSWORD_RESET_SENT: "Se ha enviado un enlace de recuperación a tu correo",
  PASSWORD_CHANGED: "Contraseña actualizada exitosamente",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PATIENTS: "/patients",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

// Validation Patterns
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access",
  REFRESH_TOKEN: "refresh",
  USER_DATA: "user_data",
  REMEMBER_ME: "remember_me",
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
