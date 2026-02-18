import "./attendance-template.css";
import React, { useRef, useState } from "react";
import logo from "../../assets/logo.png";
import social from "../../assets/social.png";

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
  const sheetRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState("");

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    const content = sheetRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const cssText = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText);
        } catch {
          return [];
        }
      })
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Relación de Asistencias</title>
  <style>
    ${cssText}
    @page { size: letter; margin: 0; }
    body { margin: 0; padding: 0; background: #fff; }
    .attendance-sheet { box-shadow: none !important; margin: 0 !important; }
    .notes-textarea { border: none !important; resize: none !important; background: transparent !important; }
  </style>
</head>
<body>
  ${content.outerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 300);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const sortedDates = [...attendedDates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="attendance-wrapper">
      <div className="print-button-wrap">
        <button onClick={handlePrint} className="print-button">
          🖨️ Imprimir
        </button>
      </div>

      <div ref={sheetRef} className="attendance-sheet">

        {/* HEADER */}
        <div className="header">
          <div className="header-logo">
            <img src={logo} alt="Logo Fisioclinic" />
          </div>
          <div className="header-text">
            <div className="header-title">FISIOCLINIC</div>
            <div className="header-subtitle">
              Centro de Terapia Física y Rehabilitación
            </div>
            <div className="document-title">Relación de Asistencias</div>
            <div className="document-period">
              <strong>PERIODO DE ASISTENCIA:</strong>
              <br />
              {formatDate(periodStart)} AL {formatDate(periodEnd)}
            </div>
          </div>
        </div>

        {/* PACIENTE */}
        <div className="patient-line">
          <strong>PACIENTE:</strong> {patientName}
        </div>

        {/* TABLA DE ASISTENCIAS */}
        <div className="attendance-list-container">
          <div className="attendance-list-title">Fecha de Asistencia</div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-date">Fecha</th>
                <th className="col-sign">Firma del Paciente</th>
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date, index) => (
                <tr key={date} className={index % 2 === 0 ? "row-even" : ""}>
                  <td className="col-num">{index + 1}</td>
                  <td className="col-date">{formatDate(date)}</td>
                  <td className="col-sign"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* OBSERVACIONES */}
        <div className="notes-section">
          <div className="notes-title">Observaciones</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe observaciones aquí..."
            className="notes-textarea"
          />
        </div>

        {/* FOOTER */}
        <div className="footer-section">
          <div className="footer-attention">Atentamente</div>
          <div className="footer-professional">{professionalName}</div>
          <div className="footer-license">{professionalLicense}</div>
          <img src={social} alt="Redes sociales Fisioclinic" className="footer-social-img" />
          <div className="footer-bar">
            Bernal Díaz del Castillo #160 entre Paseo de las Flores y S.S. Juan
            Pablo II, Fracc. Virginia, Boca del Río, Ver.&nbsp;&nbsp;
            <strong>Teléfono</strong> (2299 27 3730)&nbsp;
            <strong>Móvil</strong> (2291 21 0390)
          </div>
        </div>

      </div>
    </div>
  );
}
