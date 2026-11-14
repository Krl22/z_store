// Mismos trazos que AmazonLineIcon() en MainActivity.kt (coordenadas en % del lienzo).

export type IconName = "home" | "user" | "cart" | "menu" | "search" | "pin" | "admin" | "close" | "whatsapp";

type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number };

export function Icon({ name, size = 24, className = "", strokeWidth = 10 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="43" cy="42" r="28" />
          <line x1="64" y1="64" x2="86" y2="86" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <polyline points="12,48 50,16 88,48" />
          <rect x="24" y="47" width="52" height="38" rx="7" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="50" cy="30" r="17" />
          <path d="M21 58.9 A32 24 0 0 1 79 58.9" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <line x1="18" y1="28" x2="28" y2="28" />
          <path d="M28 28 L38 66 L76 66 L84 38 L34 38" />
          <circle cx="42" cy="80" r="5.5" fill="currentColor" stroke="none" />
          <circle cx="72" cy="80" r="5.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "menu":
    case "admin":
      return (
        <svg {...common} strokeWidth={strokeWidth * 1.1}>
          <line x1="18" y1="28" x2="82" y2="28" />
          <line x1="18" y1="50" x2="82" y2="50" />
          <line x1="18" y1="72" x2="82" y2="72" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <circle cx="50" cy="38" r="24" />
          <circle cx="50" cy="38" r="7" fill="currentColor" stroke="none" />
          <line x1="50" y1="64" x2="50" y2="88" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <line x1="26" y1="26" x2="74" y2="74" />
          <line x1="74" y1="26" x2="26" y2="74" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.05c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.83 0-1.34.7-2 .95-2.28.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.48.24.55.81 1.92.88 2.06.07.14.12.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.34Z" />
        </svg>
      );
  }
}
