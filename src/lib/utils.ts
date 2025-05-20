import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/utils.ts
export function buildAppSheetImageUrl(imagePath: string): string {
  // Si ya es una URL completa, devuélvela tal cual
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Asumiendo que AppSheet almacena las imágenes en un formato específico
  // Puedes necesitar ajustar esto según cómo AppSheet genere las URLs
  const baseUrl = "https://www.appsheet.com"; // o la URL correcta para las imágenes de AppSheet
  return `${baseUrl}/${imagePath}`;
}
