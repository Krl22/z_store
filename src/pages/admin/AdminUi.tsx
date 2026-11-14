import { useState, type ReactNode } from "react";
import { normalize } from "@/lib/format";
import { Modal } from "@/components/ui";

// Componentes del panel admin (mismo patrón que AdminPanel.kt / AdminDesign.kt de Intu).

export const ADMIN_GOLD = "#8A5D0B";
export const ADMIN_GOLD_SOFT = "#FFF4D6";
export const ADMIN_RED = "#B42318";
export const ADMIN_RED_SOFT = "#FFEDE9";
export const ADMIN_OK = "#067647";
export const ADMIN_OK_SOFT = "#E8F6EE";

export const matches = (needle: string, ...values: (string | null | undefined)[]) => normalize(values.filter(Boolean).join(" ")).includes(normalize(needle.trim()));

export function AdminSectionHeading({ title, description, count }: { title: string; description: string; count?: number | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <h2 className="flex-1 text-[22px] font-bold text-bosque-ink">{title}</h2>
        {count != null ? <AdminBadge label={String(count)} /> : null}
      </div>
      <p className="text-[12px] leading-4 text-bosque-muted">{description}</p>
    </div>
  );
}

export function AdminSearchField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-[14px] border border-bosque-border bg-white px-3 focus-within:border-bosque-green">
      <svg viewBox="0 0 24 24" className="size-6 text-bosque-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} aria-label={label} className="min-w-0 flex-1 bg-transparent text-[16px] text-bosque-ink outline-none placeholder:text-bosque-muted" />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label="Borrar búsqueda" className="grid size-9 place-items-center rounded-full text-bosque-muted">
          ✕
        </button>
      ) : null}
    </label>
  );
}

export function AdminFilters<T extends string | null>({ options, selected, onSelect }: { options: { value: T; label: string }[]; selected: T; onSelect: (value: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`h-8 shrink-0 rounded-[10px] border px-3 text-[14px] font-medium ${active ? "border-bosque-deep bg-bosque-deep text-white" : "border-bosque-border bg-white text-bosque-ink"}`}
          >
            {active ? "✓ " : ""}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 rounded-[20px] border border-bosque-border bg-white p-4 ${className}`}>{children}</div>;
}

export function AdminBadge({ label, color = "#284B2E", background = "#EEF4D8" }: { label: string; color?: string; background?: string }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-[8px] px-[9px] py-[5px] text-[12px] font-semibold leading-none" style={{ color, background }}>
      {label}
    </span>
  );
}

export function AdminDetail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <span className="text-[11px] text-bosque-muted">{label}</span>
      <span className="whitespace-pre-line break-words text-[14px] text-bosque-ink">{value || "—"}</span>
    </div>
  );
}

export function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[12px] bg-bosque-soft p-3">
      <span className="truncate text-[16px] font-bold text-bosque-ink">{value}</span>
      <span className="text-[11px] text-bosque-muted">{label}</span>
    </div>
  );
}

export function AdminStepper({ value, onChange, min = 0, max = 9999 }: { value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-10 place-items-center rounded-full text-[22px] text-bosque-ink" aria-label="Menos">
        −
      </button>
      <span className="w-10 text-center text-[16px] font-bold text-bosque-ink">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid size-10 place-items-center rounded-full text-[22px] text-bosque-ink" aria-label="Más">
        +
      </button>
    </div>
  );
}

export function AdminButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "danger" | "text";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-bosque-green text-white",
    outline: "border border-[#9AA389] bg-white text-bosque-green",
    danger: "border border-[#9AA389] bg-white text-[#B42318]",
    text: "text-bosque-green",
  }[variant];
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium disabled:opacity-40 ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function AdminLoading() {
  return (
    <div className="flex flex-col items-center gap-3 p-7">
      <span className="size-7 animate-spin rounded-full border-[3px] border-bosque-green border-t-transparent" />
      <span className="text-[12px] text-bosque-muted">Cargando…</span>
    </div>
  );
}

export function AdminMessage({ text, isError = false, onRetry }: { text: string; isError?: boolean; onRetry?: () => void }) {
  return (
    <AdminCard>
      <span className="text-[26px]" aria-hidden>
        {isError ? "☁︎" : "📥"}
      </span>
      <p className="text-[16px] text-bosque-ink">{isError ? "No se pudo completar" : "Todo al día"}</p>
      <p className="text-[14px] text-bosque-muted">{text}</p>
      {onRetry ? (
        <AdminButton variant="text" onClick={onRetry} className="self-start !px-0">
          Reintentar
        </AdminButton>
      ) : null}
    </AdminCard>
  );
}

export function AdminToggle({ title, description, checked, enabled, onChange }: { title: string; description: string; checked: boolean; enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={`flex items-center gap-3 ${enabled ? "" : "opacity-60"}`}>
      <span className="flex-1">
        <span className="block text-[16px] text-bosque-ink">{title}</span>
        <span className="block text-[12px] text-bosque-muted">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={!enabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-[52px] shrink-0 rounded-full border-2 transition ${checked ? "border-bosque-green bg-bosque-green" : "border-[#9AA389] bg-bosque-soft"}`}
      >
        <span className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${checked ? "left-[22px] size-6 bg-white" : "left-1 size-4 bg-[#9AA389]"}`} />
      </button>
    </label>
  );
}

export function AdminConfirm({
  title,
  message,
  confirmLabel,
  destructive,
  requireAcknowledgement,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  destructive: boolean;
  requireAcknowledgement?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [acknowledged, setAcknowledged] = useState(!requireAcknowledgement);
  return (
    <Modal onClose={onClose} className="flex flex-col gap-4 !bg-white p-6">
      <h2 className="text-[22px] text-bosque-ink">{title}</h2>
      <p className="text-[14px] leading-5 text-bosque-muted">{message}</p>
      {requireAcknowledgement ? (
        <label className="flex items-center gap-3 text-[14px] text-bosque-ink">
          <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="size-5 accent-bosque-green" />
          {requireAcknowledgement}
        </label>
      ) : null}
      <div className="flex justify-end gap-2">
        <AdminButton variant="text" onClick={onClose}>
          Volver
        </AdminButton>
        <button
          type="button"
          disabled={!acknowledged}
          onClick={onConfirm}
          className="h-10 rounded-full px-4 text-[14px] font-medium disabled:text-bosque-muted"
          style={{ color: acknowledged ? (destructive ? ADMIN_RED : "#426B35") : undefined }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function adminDate(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("es-PE", { timeZone: "America/Lima", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
