import api from "../api/axios";

export const logout = () => {
  // 1️⃣ Borrar tokens del navegador
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  // 2️⃣ Limpiar Authorization de axios
  delete api.defaults.headers.common["Authorization"];

  // 3️⃣ Redirigir al login
  window.location.href = "/login";
};