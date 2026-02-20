import "./attendance-template.css";
import React, { useRef, useState } from "react";
import logo from "../../assets/logo.png";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

// Vite: coloca el .docx en src/assets/ e impórtalo así
// CRA:  pon el .docx en /public/ y usa: const templateUrl = "/FISIOCLINIC_sesiones_template.docx";
//import templateUrl from "../../assets/bicatora_teplate.docx?url";

const TEMPLATE_URL = "/bicatora_teplate.docx";

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
  const [isGenerating, setIsGenerating] = useState(false);

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

  // ── Descarga DOCX desde template ────────────────────────────────────────
  const handleDownloadDocx = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(TEMPLATE_URL);
      if (!response.ok) throw new Error("No se pudo cargar el template .docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        paciente: patientName,
        fechaReporte,
        periodoInicio: formatDate(periodStart),
        periodoFin: formatDate(periodEnd),
        sesiones,
        nombreMedico: professionalName,
        cedulaProfesional: professionalLicense,
        firmaMedico: "",
      });

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, `Asistencias_${patientName.replace(/\s+/g, "_")}.docx`);
    } catch (error) {
      console.error("Error al generar el DOCX:", error);
      alert("Ocurrió un error al generar el documento. Revisa la consola.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="attendance-wrapper">

      {/* ── Botones ── */}
      <div className="action-buttons no-print">
        <button onClick={handlePrint} className="btn-print">
          🖨️ Imprimir
        </button>
        <button
          onClick={handleDownloadDocx}
          disabled={isGenerating}
          className="btn-download"
        >
          {isGenerating ? "Generando..." : "⬇️ Descargar Word (.docx)"}
        </button>
      </div>

      {/* ── Vista previa ── */}
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
