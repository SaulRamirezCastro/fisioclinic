import "./attendance-template.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { renderAsync } from "docx-preview";

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
        <button onClick={handlePrint} disabled={isLoading} className="btn-print">
          🖨️ Imprimir
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading || isLoading}
          className="btn-download"
        >
          {isDownloading ? "Generando..." : "⬇️ Descargar Word (.docx)"}
        </button>
      </div>

      {/* ── Spinner mientras carga ── */}
      {isLoading && (
        <div className="preview-loading no-print">
          <div className="spinner" />
          <span>Generando vista previa...</span>
        </div>
      )}

      {/* ── Contenedor donde docx-preview inyecta el documento ── */}
      <div
        ref={previewRef}
        className="docx-preview-container"
        style={{ display: isLoading ? "none" : "block" }}
      />

    </div>
  );
}
