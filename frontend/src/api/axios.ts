import axios from "axios";

const API_BASE_URL = process.env.DJANGO_API;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔹 Agregar access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Manejar expiración
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) throw new Error("No refresh token");

        const response = await axios.post(
          "http://localhost:8000/api/auth/refresh/",
          {
            refresh,
          }
        );

        const newAccess = response.data.access;

        localStorage.setItem("access", newAccess);

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        // ❌ Si falla refresh → logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
