import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// Types
interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

interface ErrorResponse {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

// Constants
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/",
  TIMEOUT: 30000, // 30 seconds
  REFRESH_ENDPOINT: "auth/refresh/",
  LOGIN_PATH: "/login",
} as const;

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access",
  REFRESH_TOKEN: "refresh",
} as const;

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Clear authentication data and redirect to login
 */
const clearAuthAndRedirect = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  isRefreshing = false;
  failedQueue = [];

  // Only redirect if not already on login page
  if (window.location.pathname !== API_CONFIG.LOGIN_PATH) {
    window.location.href = API_CONFIG.LOGIN_PATH;
  }
};

/**
 * Request Interceptor - Add access token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⚠️ FIX: Si el body es FormData, NO establecer Content-Type
    // Axios lo hace automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      // Eliminar Content-Type para que Axios lo agregue automáticamente
      if (config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else if (!config.headers['Content-Type']) {
      // Para otros tipos de datos, usar JSON por defecto
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle token expiration and refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      console.error("❌ Network error:", error.message);
      return Promise.reject({
        ...error,
        message: "Error de conexión. Verifica tu internet.",
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      // No refresh token available
      if (!refreshToken) {
        console.warn("⚠️ No refresh token found");
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post<RefreshTokenResponse>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.REFRESH_ENDPOINT}`,
          { refresh: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const newAccessToken = response.data.access;

        // Store new access token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        // If new refresh token provided, update it
        if (response.data.refresh) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or expired
        console.error("❌ Token refresh failed:", refreshError);
        processQueue(refreshError as AxiosError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    const errorMessage = getErrorMessage(error);
    console.error(`❌ API Error [${error.response.status}]:`, errorMessage);

    return Promise.reject(error);
  }
);

/**
 * Extract user-friendly error message from error response
 */
const getErrorMessage = (error: AxiosError<ErrorResponse>): string => {
  if (error.response?.data) {
    const data = error.response.data;

    // Check for common error message fields
    if (data.message) return data.message;
    if (data.detail) return data.detail;

    // Check for validation errors
    if (data.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
  }

  // Default error messages by status code
  switch (error.response?.status) {
    case 400:
      return "Solicitud inválida. Verifica los datos enviados.";
    case 401:
      return "No autorizado. Por favor inicia sesión nuevamente.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "Recurso no encontrado.";
    case 415:
      return "Tipo de contenido no soportado.";
    case 422:
      return "Error de validación en los datos enviados.";
    case 429:
      return "Demasiadas solicitudes. Intenta más tarde.";
    case 500:
      return "Error del servidor. Intenta más tarde.";
    case 503:
      return "Servicio no disponible. Intenta más tarde.";
    default:
      return "Ha ocurrido un error inesperado.";
  }
};

/**
 * Utility function to manually clear tokens (for logout)
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Utility function to check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Utility function to get access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Utility function to set tokens (for login)
 */
export const setAuthTokens = (access: string, refresh: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
};

/**
 * ✅ NUEVO: Helper para subir archivos
 * Uso: uploadFile('/patients/123/upload_photo/', file)
 */
export const uploadFile = async (
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData?: Record<string, any>
): Promise<any> => {
  const formData = new FormData();
  formData.append(fieldName, file);

  // Agregar datos adicionales si existen
  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
  }

  // NO establecer Content-Type, Axios lo hace automáticamente
  return api.post(url, formData);
};

/**
 * ✅ NUEVO: Helper para subir múltiples archivos
 */
export const uploadFiles = async (
  url: string,
  files: File[],
  fieldName: string = 'files'
): Promise<any> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append(fieldName, file);
  });

  return api.post(url, formData);
};

export default api;
