import "./attendance-template.css";
import React, { useRef, useState } from "react";
import logo from "../../assets/logo.png";

interface Props {
  patientName: string;
  periodStart: string;
  periodEnd: string;
  attendedDates: string[];
  professionalName?: string;
  professionalLicense?: string;
}

export default function AttendanceTemplate({
  patientName,
  periodStart,
  periodEnd,
  attendedDates,
  professionalName = "Lic. T.F. Salvador Antonio Pomar Castañeda",
  professionalLicense = "CÉD. PROF. 3719269",
}: Props) {

  const printRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState("");

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    // Separar manualmente YYYY-MM-DD
    const [year, month, day] = date.split("-").map(Number);

    const parsed = new Date(year, month - 1, day);

    return parsed.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <div>

      <div ref={printRef} className="attendance-sheet">

        {/* HEADER */}
        <div className="header">

          <div className="header-logo">
            <img src={logo} alt="Logo" />
          </div>

          <div className="header-text">
            <div className="header-title">FISIOCLINIC</div>

            <div className="header-subtitle">
              Centro de Terapia Física y Rehabilitación
            </div>

            <div className="document-title">
              RELACIÓN DE ASISTENCIAS
            </div>

            <div className="document-period">
              <strong>PERIODO DE ASISTENCIA:</strong>{" "}
              <br/>
              {formatDate(periodStart)} AL {formatDate(periodEnd)}
            </div>
          </div>

        </div>

        {/* PACIENTE */}
        <div className="patient-line">
          <strong>PACIENTE:</strong> {patientName}
        </div>

        {/* LISTA */}
        <div className="attendance-list-container">

          <div className="attendance-list-title">
            Fecha de Asistencia
          </div>

          <div className="attendance-list">
            {[...attendedDates]
              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
              .map((date, index) => (
                <div key={date} className="attendance-item">
                  {index + 1}. {formatDate(date)}
                </div>
            ))}
          </div>

        </div>

        {/* OBSERVACIONES */}
        {notes && (
          <div className="notes-section">
            <div className="notes-title">OBSERVACIONES</div>
            <div className="notes-box">{notes}</div>
          </div>
        )}

      {/* FOOTER */}
      <div className="footer-section">

        <div className="footer-attention">
          ATENTAMENTE
        </div>

        <div className="footer-professional">
          Lic. T.F. Salvador Antonio Pomar Castañeda
        </div>

        <div className="footer-license">
          CED. PROF. 3719269
        </div>

        {/* Redes */}
        <div className="footer-social">

          <div>Fisioclinic_ver</div>
          <div>www.fisioclinic.com.mx</div>
          <div>Fisioclinic s.c.</div>

        </div>

        {/* Banda inferior */}
        <div className="footer-bar">
          Bernal Díaz del Castillo #160 entre Paseo de las Flores y S.S. Juan Pablo II,
          Fracc. Virginia, Boca del Río, Ver.
          Teléfono (2299 27 3730) Móvil (2291 21 0390)
        </div>

      </div>


      </div>

    </div>
  );
}

