import { useEffect, useState, type ReactNode } from "react";
import { discountPercent, formatSoles, hasValidOffer, currentPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Icon } from "./Icon";

// Piezas compartidas, cada una equivalente a un @Composable de MainActivity.kt.

/** SectionTitle() */
export function SectionTitle({ title, detail, className = "" }: { title: string; detail?: string; className?: string }) {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <h2 className="text-[20px] font-black text-bosque-ink">{title}</h2>
      {detail ? <span className="text-[12px] font-bold text-bosque-muted">{detail}</span> : null}
    </div>
  );
}

/** Badge() */
export function Badge({ text, color, textColor, className = "" }: { text: string; color: string; textColor: string; className?: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-[5px] text-[11px] font-black leading-none ${className}`} style={{ background: color, color: textColor }}>
      {text}
    </span>
  );
}

/** StatusBadge() */
export function StatusBadge({ text, active }: { text: string; active: boolean }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-[10px] py-[6px] text-[12px] font-black leading-none ${
        active ? "border-[#D3E9D5] bg-store-mint text-store-link" : "border-[#F4CDBE] bg-[#FFEEE7] text-bosque-warmth"
      }`}
    >
      {text}
    </span>
  );
}

/** StatusPill(): mensaje cerrable bajo el encabezado. */
export function StatusPill({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-bosque-border bg-bosque-strong py-1.5 pl-3 pr-1.5">
      <p className="flex-1 text-[12px] leading-4 text-bosque-muted">{message}</p>
      <button type="button" onClick={onDismiss} className="grid size-7 place-items-center rounded-full text-[14px] font-black text-bosque-muted" aria-label="Cerrar mensaje">
        x
      </button>
    </div>
  );
}

/** Botón amarillo de acción (StoreActionYellow). */
export function YellowButton({
  children,
  onClick,
  disabled,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-store-yellow font-black text-bosque-ink transition active:scale-[0.98] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

/** Botón secundario (BosqueSurfaceStrong + BosqueGreenDeep). */
export function SoftButton({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-bosque-strong font-black text-bosque-deep transition active:scale-[0.98] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

/** CartActionChip() */
export function ActionChip({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-store-line bg-white px-3.5 py-2 text-[14px] font-bold text-bosque-ink">
      {text}
    </button>
  );
}

/** EmptyStateCard() */
export function EmptyStateCard({ title, detail, action, onAction, className = "" }: { title: string; detail: string; action?: string; onAction?: () => void; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 rounded-[24px] border border-bosque-border bg-white p-[18px] ${className}`}>
      <div className="grid size-12 place-items-center rounded-full bg-store-mint text-store-link">
        <Icon name="search" size={27} />
      </div>
      <h3 className="text-[21px] font-black text-bosque-ink">{title}</h3>
      <p className="text-[13px] leading-[18px] text-bosque-muted">{detail}</p>
      {action ? (
        <YellowButton onClick={onAction} className="h-12 w-full">
          {action}
        </YellowButton>
      ) : null}
    </div>
  );
}

/** ProductPriceBlock() */
export function PriceBlock({ product, priceSize, originalSize }: { product: Pick<Product, "price" | "offer_price">; priceSize: number; originalSize: number }) {
  if (!hasValidOffer(product)) {
    return (
      <p className="font-black leading-tight text-bosque-ink" style={{ fontSize: priceSize }}>
        {formatSoles(product.price)}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-bosque-muted line-through" style={{ fontSize: originalSize }}>
          {formatSoles(product.price)}
        </span>
        <span className="rounded-full bg-[#FFF2D2] px-1.5 py-0.5 font-black text-bosque-warmth" style={{ fontSize: originalSize }}>
          -{discountPercent(product)}%
        </span>
      </div>
      <p className="font-black leading-tight text-bosque-deep" style={{ fontSize: priceSize }}>
        {formatSoles(currentPrice(product))}
      </p>
    </div>
  );
}

/** RemoteImage(): imagen con fondo de color y texto mientras carga o si falla. */
export function RemoteImage({
  url,
  alt,
  className = "",
  background = "#EEF4D8",
  placeholder = "IMG",
}: {
  url: string;
  alt: string;
  className?: string;
  background?: string;
  placeholder?: string;
}) {
  // Se guarda la URL (no un booleano) para que una imagen en caché no quede oculta al cambiar de URL.
  const [loadedUrl, setLoadedUrl] = useState("");
  const [failedUrl, setFailedUrl] = useState("");
  const loaded = url !== "" && loadedUrl === url;
  const showImage = url && failedUrl !== url;
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ background }}>
      {!loaded ? <span className="text-[14px] font-black text-bosque-muted">{placeholder}</span> : null}
      {showImage ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0 && loadedUrl !== url) setLoadedUrl(url);
          }}
          onLoad={() => setLoadedUrl(url)}
          onError={() => setFailedUrl(url)}
          className={`absolute inset-0 size-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
    </div>
  );
}

/** ProductImage(): RemoteImage con el color de acento del producto. */
export function ProductImage({ product, url, className = "" }: { product: Product; url?: string; className?: string }) {
  const image = url ?? product.image_urls.find((u) => u.trim().startsWith("http")) ?? "";
  return (
    <RemoteImage
      url={image.trim()}
      alt={product.name}
      background={hexWithAlpha(product.accent_hex, 0.6)}
      placeholder={product.name.slice(0, 2).toUpperCase()}
      className={`rounded-[18px] ${className}`}
    />
  );
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(238,244,216,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** CheckoutLine() */
export function CheckoutLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={strong ? "text-[17px] font-black text-bosque-ink" : "text-[13px] font-bold text-bosque-muted"}>{label}</span>
      <span className={strong ? "text-[20px] font-black text-bosque-warmth" : "text-right text-[14px] font-black text-bosque-ink"}>{value}</span>
    </div>
  );
}

/** AccountLine() */
export function AccountLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="text-[13px] font-bold text-bosque-muted">{label}</span>
      <span className="text-right text-[14px] font-black text-bosque-ink">{value}</span>
    </div>
  );
}

/** Dialog de Compose: fondo oscuro y tarjeta centrada con scroll. */
export function Modal({ children, onClose, className = "", labelledBy, wide = false }: { children: ReactNode; onClose: () => void; className?: string; labelledBy?: string; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-[26px] bg-bosque-surface ${wide ? "max-w-[460px] md:max-w-[920px]" : "max-w-[460px]"} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/** CenterStatusToast(): aviso "OK" en el centro. */
export function CenterToast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center px-8">
      <div className="animate-toast flex items-center gap-2.5 rounded-[20px] border border-bosque-border bg-white px-[18px] py-3.5 shadow-lg">
        <span className="grid size-[26px] place-items-center rounded-full bg-bosque-deep text-[10px] font-black text-white">OK</span>
        <div>
          <p className="text-[15px] font-black text-bosque-ink">{message}</p>
          <p className="text-[12px] font-bold text-bosque-muted">Cambios sincronizados</p>
        </div>
      </div>
    </div>
  );
}

/** ProductListSkeleton() */
export function ProductListSkeleton() {
  const block = "rounded-[14px] bg-gradient-to-r from-bosque-strong via-bosque-soft to-bosque-strong animate-pulse";
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex h-[170px] gap-3 rounded-[22px] border border-bosque-border/65 bg-white p-3">
          <div className={`${block} h-[146px] w-[120px]`} />
          <div className="flex flex-1 flex-col gap-2.5">
            <div className={`${block} h-[18px] w-[55%]`} />
            <div className={`${block} h-[22px] w-full`} />
            <div className={`${block} h-[14px] w-[76%]`} />
            <div className={`${block} mt-1 h-7 w-[42%]`} />
            <div className={`${block} h-9 w-[68%]`} />
          </div>
        </div>
      ))}
    </div>
  );
}
