import { Routes, Route } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Patients from "./pages/Patients";
import ProtectedRoute from "./router/ProtectedRoute";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
