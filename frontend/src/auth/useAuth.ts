import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { API_ENDPOINTS, ERROR_MESSAGES, ROUTES, STORAGE_KEYS } from "../constants";

// Types
interface LoginResponse {
  access: string;
  refresh: string;
}

interface LoginError {
  response?: {
    status: number;
    data?: {
      message?: string;
      detail?: string;
    };
  };
  message?: string;
}

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        email: email.trim(),
        password,
      });

      // Store tokens
      // Note: Consider using httpOnly cookies for better security
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.data.refresh);

      // Navigate to patients page
      navigate(ROUTES.PATIENTS);
    } catch (err) {
      const error = err as LoginError;

      // Handle different error scenarios
      if (error.response?.status === 401) {
        setError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      } else if (error.response?.status === 500) {
        setError(ERROR_MESSAGES.SERVER_ERROR);
      } else if (!error.response) {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      } else {
        setError(
          error.response.data?.message ||
          error.response.data?.detail ||
          ERROR_MESSAGES.SERVER_ERROR
        );
      }

      console.error("❌ Login error:", err);
      throw err; // Re-throw to allow component to handle if needed
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    // Clear tokens
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    // Navigate to login
    navigate(ROUTES.LOGIN);
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    login,
    logout,
    loading,
    error,
    clearError,
  };
}