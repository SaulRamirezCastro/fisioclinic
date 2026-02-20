import "./attendance-template.css";
import React, { useEffect, useRef } from "react";
import logo from "../../assets/logo.png";

interface Props {
  patientName: string;
  periodStart: string;
  periodEnd: string;
  attendedDates: string[];
  reportDate?: string;
  professionalName?: string;
  professionalLicense?: string;
}

export default function AttendanceTemplate({
  patientName,
  periodStart,
  periodEnd,
  attendedDates,
  reportDate,
  professionalName = "Lic. T.F. Salvador Antonio Pomar Castañeda",
  professionalLicense = "CÉD. PROF. 3719269",
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const fechaReporte = formatDate(reportDate ?? today);

  const sortedDates = [...attendedDates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const sesiones = sortedDates.map((date, index) => ({
    numeroSesion: index + 1,
    fechaSesion: formatDate(date),
    firma: "",
  }));

  // Inyecta estilos de impresión que solo muestran el template
  useEffect(() => {
    const styleId = "attendance-print-style";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #attendance-print-root { display: block !important; }
        #attendance-print-root * { display: revert !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

  return (
    <div id="attendance-print-root" className="attendance-wrapper">
      <div ref={printRef} className="attendance-sheet">

        {/* HEADER */}
        <div className="header">
          <div className="header-logo">
            <img src={logo} alt="Logo Fisioclinic" />
          </div>
        </div>

        {/* DATOS DEL REPORTE */}
        <div className="report-meta">
          <div className="report-meta-row">
            <span className="label">Paciente:</span>
            <span className="value">{patientName}</span>
          </div>
          <div className="report-meta-row">
            <span className="label">Fecha del reporte:</span>
            <span className="value">{fechaReporte}</span>
          </div>
          <div className="report-meta-row">
            <span className="label">Periodo de asistencias:</span>
            <span className="value">
              {formatDate(periodStart)} al {formatDate(periodEnd)}
            </span>
          </div>
        </div>

        {/* TABLA DE SESIONES */}
        <div className="sessions-section">
          <div className="sessions-title">REGISTRO DE SESIONES ASISTIDAS</div>
          <table className="sessions-table">
            <thead>
              <tr>
                <th>No. Sesión</th>
                <th>Fecha</th>
                <th>Firma del Paciente</th>
              </tr>
            </thead>
            <tbody>
              {sesiones.length > 0 ? (
                sesiones.map((s) => (
                  <tr key={s.numeroSesion}>
                    <td className="center">{s.numeroSesion}</td>
                    <td className="center">{s.fechaSesion}</td>
                    <td className="firma-cell"></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="center empty-row">
                    Sin sesiones registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FIRMA DEL MÉDICO */}
        <div className="doctor-signature">
          <div className="signature-line"></div>
          <div className="doctor-name">{professionalName}</div>
          <div className="doctor-license">{professionalLicense}</div>
        </div>

        {/* FOOTER */}
        <div className="footer-section">
          <div className="footer-social">
            <span>Fisioclinic_ver</span>
            <span>www.fisioclinic.com.mx</span>
            <span>Fisioclinic s.c.</span>
          </div>
          <div className="footer-bar">
            Bernal Díaz del Castillo #160 entre Paseo de las Flores y S.S. Juan
            Pablo II, Fracc. Virginia, Boca del Río, Ver.{" "}
            <strong>Teléfono</strong> (2299 27 3730){" "}
            <strong>Móvil</strong> (2291 21 0390)
          </div>
        </div>

      </div>
    </div>
  );
}
