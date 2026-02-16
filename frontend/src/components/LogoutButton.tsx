import { useNavigate } from "react-router-dom";
import Button from "./Button";
import api from "../api/axios";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1️⃣ Eliminar tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // 2️⃣ Limpiar header de axios
    delete api.defaults.headers.common["Authorization"];

    // 3️⃣ Redirigir al login
    navigate("/");
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}
