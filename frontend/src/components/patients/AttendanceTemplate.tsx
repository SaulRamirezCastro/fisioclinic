import "./attendance-template.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { renderAsync } from "docx-preview";
import logo from "../../assets/logo.png";

const TEMPLATE_URL = "/bitacora_template.docx";

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
  const previewRef  = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const today       = new Date().toISOString().split("T")[0];
  const fechaReporte = formatDate(reportDate ?? today);

  const sortedDates = [...attendedDates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const sesiones = sortedDates.map((date, index) => ({
    numeroSesion: index + 1,
    fechaSesion:  formatDate(date),
    firma:        "",
  }));

  // ── Genera el blob del .docx con datos inyectados ────────────────────────
  const buildDocxBlob = useCallback(async (): Promise<Blob> => {
    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) {
      throw new Error(
        `No se pudo cargar el template (${response.status}). ` +
        `Asegúrate de que el archivo está en /public/bicatora_teplate.docx`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.render({
      paciente:          patientName,
      fecha: fechaReporte,
      periodoInicio:     formatDate(periodStart),
      periodoFin:        formatDate(periodEnd),
      sesiones,
      nombreMedico:      professionalName,
      cedulaProfesional: professionalLicense,
      firmaMedico:       "",
    });

    return doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientName, periodStart, periodEnd, reportDate, attendedDates, professionalName, professionalLicense]);

  // ── Renderiza la vista previa con docx-preview ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    buildDocxBlob()
      .then(async (blob) => {
        if (cancelled || !previewRef.current) return;
        // Limpia el contenedor antes de renderizar
        previewRef.current.innerHTML = "";
        await renderAsync(blob, previewRef.current, undefined, {
          className: "docx-preview-content",
          inWrapper: false,       // sin wrapper extra
          ignoreWidth: true,      // ocupa el ancho del contenedor
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          useBase64URL: true,     // imágenes como base64
        });
      })
      .catch((err: Error) => {
        if (!cancelled && previewRef.current) {
          previewRef.current.innerHTML = `<p style="color:red">⚠️ ${err.message}</p>`;
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [buildDocxBlob]);

  // ── Impresión: solo muestra el template ──────────────────────────────────
  useEffect(() => {
    const styleId = "attendance-print-style";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #attendance-print-root { display: block !important; }
        #attendance-print-root .no-print { display: none !important; }
        #attendance-print-root .docx-wrapper { padding: 0 !important; background: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(styleId)?.remove(); };
  }, []);

  // ── Descarga el .docx ─────────────────────────────────────────────────────
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await buildDocxBlob();
      saveAs(blob, `Asistencias_${patientName.replace(/\s+/g, "_")}.docx`);
    } catch (error: any) {
      if (error.properties?.errors?.length) {
        const details = error.properties.errors
          .map((e: any) => `• ${e.properties?.explanation ?? e.message}`)
          .join("\n");
        alert("Error en el template:\n" + details);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div id="attendance-print-root" className="attendance-wrapper">

      {/* ── Botones ── */}
      <div className="action-buttons no-print">
        <button
          onClick={handleDownload}
          disabled={isDownloading || isLoading}
          className="btn-download"
        >
          {isDownloading ? "Generando..." : "⬇️ Descargar Word (.docx)"}
        </button>
      </div>

      {/* ── Vista previa ── */}

        {/* HEADER */}
        <div className="header">
          <div className="header-logo">
            <img src={logo} alt="Logo Fisioclinic" />
          </div>
          <div className="header-text">
            <div className="document-title">RELACIÓN DE ASISTENCIAS</div>
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
        <div className="footer-section">
          <div className="footer-attention">ATENTAMENTE</div>
          <div className="footer-professional">{professionalName}</div>
          <div className="footer-license">{professionalLicense}</div>
          <div className="footer-social">
            <div>Fisioclinic_ver</div>
            <div>www.fisioclinic.com.mx</div>
            <div>Fisioclinic s.c.</div>
          </div>
          <div className="footer-bar">
            Bernal Díaz del Castillo #160 entre Paseo de las Flores y S.S. Juan
            Pablo II, Fracc. Virginia, Boca del Río, Ver. Teléfono (2299 27
            3730) Móvil (2291 21 0390)
          </div>
        </div>
    </div>
  );
}
