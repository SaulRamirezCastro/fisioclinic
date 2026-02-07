import React from "react";
import logo from "../assets/logo.png";

type SidebarProps = {
  children?: React.ReactNode;
};

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={logo}
          alt="FisioClinic"
          className="w-28 mb-2"
        />
        <span className="text-sm font-semibold text-emerald-700">
          FisioClinic
        </span>
      </div>

      {/* Contenido dinámico */}
      <div className="w-64 bg-white border-r p-4 flex flex-col gap-3 h-screen">
        {children}
      </div>
    </aside>
  );
}
