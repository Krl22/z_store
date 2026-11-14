import type { Product } from "./types";

// Textos de la ficha de producto. Basados en productUsageCopy()/productWarningCopy() de la app,
// sin afirmaciones de salud ni beneficios (ver "Nunca decir" en marketing/brand.md).

export const isKit = (p: Product) => /kit/i.test(`${p.category} ${p.format ?? ""}`);

export function productDescription(p: Product): string {
  const latin = p.latin_name?.trim();
  const format = (p.format ?? "").trim() || p.category.toLowerCase();
  const name = latin ? `${p.name} (${latin})` : p.name;
  return isKit(p)
    ? `${name}: ${format}. Pídelo por WhatsApp y coordinamos el pago con Yape y la entrega en Lima.`
    : `${name}, presentación ${format}. Pídelo por WhatsApp y coordinamos el pago con Yape y la entrega en Lima.`;
}

export function productUsageCopy(p: Product): string[] {
  const format = (p.format ?? "").toLowerCase();
  if (isKit(p)) {
    return [
      "Sigue las instrucciones incluidas en el kit.",
      "Guárdalo en un lugar fresco y seco hasta empezar.",
      "Si tienes dudas, escríbenos por WhatsApp.",
    ];
  }
  if (/caps|capsula|cápsula/.test(format)) {
    return [
      "Tomar con agua siguiendo la indicación del empaque.",
      "Evitar duplicar porciones si también consumes otros suplementos similares.",
    ];
  }
  if (/tintura/.test(format)) {
    return [
      "Agitar antes de usar y diluir las gotas en agua, infusión o bebida tibia.",
      "Guardar bien cerrado, lejos de calor directo y luz intensa.",
    ];
  }
  return [
    "Mezclar con café, cacao, batidos o infusiones hasta integrar bien.",
    "Usar una medida constante para mantener el sabor.",
    "Cerrar el envase después de cada uso para conservar textura y aroma.",
  ];
}

export function productWarningCopy(p: Product): string[] {
  if (isKit(p)) return [];
  return [
    "No reemplaza una dieta variada ni la indicación de un profesional de salud.",
    "Consulta a un profesional si estás embarazada, lactando, tomando medicación o tienes una condición médica.",
    "Mantener fuera del alcance de niños.",
  ];
}
