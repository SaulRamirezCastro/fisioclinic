import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import React from "react";

export default function Navbar() {
  return (
      <nav className="bg-blue-600 text-white px-6 py-3 flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/patients">Pacientes</Link>
          <Link to="/appointments">Citas</Link>
      </nav>
  );
}
