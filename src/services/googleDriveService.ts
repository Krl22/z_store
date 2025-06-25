// URL del Google Apps Script (reemplaza con tu URL)
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyVsfWeNMwZThvhaLuauJ1QFNW23peEMdj2Vmotjpi5ELlZQ5LQdAlE7CQD2woBDfOz/exec";

interface ScriptResponse {
  success: boolean;
  fileId?: string;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

// Cache para URLs de imágenes
const imageUrlCache = new Map<string, string>();
// Cache para archivos no encontrados (evita reintentos)
const notFoundCache = new Set<string>();

export const getImageUrlFromDrive = async (
  fileName: string
): Promise<string | null> => {
  // Verificar cache primero
  if (imageUrlCache.has(fileName)) {
    return imageUrlCache.get(fileName) || null;
  }

  // Si ya sabemos que el archivo no existe, devolver fallback inmediatamente
  if (notFoundCache.has(fileName)) {
    const cleanFileName = fileName.split("/").pop() || fileName;
    return `/Productos_Images/${cleanFileName}`;
  }

  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.warn("Google Apps Script URL not configured");
    return null;
  }

  try {
    // Extraer solo el nombre del archivo, sin la ruta
    const cleanFileName = fileName.split("/").pop() || fileName;

    // Llamar al Google Apps Script
    const response = await fetch(
      `${GOOGLE_APPS_SCRIPT_URL}?fileName=${encodeURIComponent(cleanFileName)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ScriptResponse = await response.json();

    if (data.success && data.downloadUrl) {
      // Guardar en cache
      imageUrlCache.set(fileName, data.downloadUrl);
      return data.downloadUrl;
    } else {
      console.warn(`File not found in Google Drive: ${cleanFileName}`);
      // Marcar como no encontrado para evitar reintentos
      notFoundCache.add(fileName);
      // Fallback a imagen local
      const fallbackUrl = `/Productos_Images/${cleanFileName}`;
      imageUrlCache.set(fileName, fallbackUrl);
      return fallbackUrl;
    }
  } catch (error) {
    console.error("Error fetching from Google Apps Script:", error);
    // Marcar como no encontrado para evitar reintentos
    notFoundCache.add(fileName);
    // Fallback a imagen local
    const cleanFileName = fileName.split("/").pop() || fileName;
    const fallbackUrl = `/Productos_Images/${cleanFileName}`;
    imageUrlCache.set(fileName, fallbackUrl);
    return fallbackUrl;
  }
};

// Función para pre-cargar URLs de múltiples imágenes
export const preloadImageUrls = async (fileNames: string[]): Promise<void> => {
  const promises = fileNames.map((fileName) => getImageUrlFromDrive(fileName));
  await Promise.all(promises);
};

// Función para limpiar el cache si es necesario
export const clearImageCache = (): void => {
  imageUrlCache.clear();
  notFoundCache.clear();
};
