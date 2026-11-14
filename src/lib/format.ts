import type { Product } from "./types";

// Mismas reglas que MainActivity.kt (formatSoles, currentPrice, discountPercent, estados).

export const formatSoles = (amount: number) => `S/ ${amount}.00`;

export const hasValidOffer = (p: Pick<Product, "offer_price" | "price">) =>
  p.offer_price != null && p.offer_price > 0 && p.offer_price < p.price;

export const currentPrice = (p: Pick<Product, "offer_price" | "price">) => (hasValidOffer(p) ? (p.offer_price as number) : p.price);

export const discountPercent = (p: Pick<Product, "offer_price" | "price">) =>
  p.price <= 0 || !hasValidOffer(p) ? 0 : Math.max(1, Math.round(((p.price - currentPrice(p)) * 100) / p.price));

export function formatOrderStatus(status: string): string {
  switch (status) {
    case "pending_payment":
      return "Pendiente de pago";
    case "paid":
      return "Pagado";
    case "preparing":
      return "Preparando";
    case "ready":
      return "Listo";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status || "Pendiente de pago";
  }
}

export function formatPaymentStatus(status: string): string {
  switch (status) {
    case "pending":
      return "Pendiente (Yape por WhatsApp)";
    case "paid":
      return "Pagado";
    case "simulated_paid":
      return "Pago demo (sin cobro)";
    default:
      return status;
  }
}

export const orderCode = (id: string) => id.slice(0, 8).toUpperCase();

/** Fechas de Supabase en hora de Lima. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Mn}+/gu, "")
    .toLowerCase();

/** Dígitos de un celular peruano (9XXXXXXXX), como peruMobileDigits() en la app. */
export function peruMobileDigits(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const local = digits.startsWith("51") && digits.length > 9 ? digits.slice(2) : digits;
  const last9 = local.slice(-9);
  return last9.startsWith("9") ? last9 : "";
}

export const formatPeruMobile = (digits: string) => digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();

/** wa.me para un número ya en formato internacional o un celular peruano. */
export function whatsappUrl(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, "");
  let international = "";
  if (digits.length === 9 && digits.startsWith("9")) international = `51${digits}`;
  else if (digits.length >= 10) international = digits;
  else return null;
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
}

export const productImage = (p: Pick<Product, "image_urls">) =>
  p.image_urls.map((u) => u.trim()).find((u) => u.startsWith("http://") || u.startsWith("https://")) ?? "";

export const productImages = (p: Pick<Product, "image_urls">) =>
  [...new Set(p.image_urls.map((u) => u.trim()).filter((u) => u.startsWith("http://") || u.startsWith("https://")))];

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "ZD";
