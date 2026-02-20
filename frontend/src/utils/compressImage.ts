interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/jpeg" | "image/webp" | "image/png";
}

interface CompressImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
}

/**
 * Comprime una imagen usando Canvas API antes de subirla al backend.
 *
 * @param file        - Archivo de imagen original (File)
 * @param options     - Opciones de compresión
 * @returns           - Objeto con el archivo comprimido y métricas de tamaño
 *
 * @example
 * const { file, originalSize, compressedSize } = await compressImage(rawFile);
 *
 * @example — con opciones personalizadas
 * const { file } = await compressImage(rawFile, {
 *   maxWidth: 800,
 *   maxHeight: 800,
 *   quality: 0.8,
 *   outputType: "image/webp",
 * });
 */
export async function compressImage(
  file: File,
  {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    outputType = "image/jpeg",
  }: CompressImageOptions = {}
): Promise<CompressImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`El archivo "${file.name}" no es una imagen válida.`);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // Redimensionar manteniendo aspect ratio solo si supera los límites
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No se pudo obtener el contexto 2D del canvas."));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Error al generar el blob comprimido."));

          const compressedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });

          const savedPercent = Math.round(
            ((file.size - compressedFile.size) / file.size) * 100
          );

          resolve({
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            savedPercent,
          });
        },
        outputType,
        quality
      );
    };

    img.onerror = () => reject(new Error(`No se pudo cargar la imagen "${file.name}".`));
    reader.onerror = () => reject(new Error(`No se pudo leer el archivo "${file.name}".`));

    reader.readAsDataURL(file);
  });
}

/**
 * Formatea bytes a una cadena legible (KB o MB).
 *
 * @example
 * formatBytes(153600) // → "150.0 KB"
 * formatBytes(2097152) // → "2.0 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}