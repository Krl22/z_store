import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";

// AmazonStyleHeader(): degradado menta, buscador tipo píldora y chips con scroll horizontal.
// Los chips se esconden al bajar y vuelven al subir, igual que en la app.

export type HeaderOption = { key: string; text: string; leading?: IconName };

export const SORT_OPTIONS = [
  { key: "relevance", label: "Relevancia" },
  { key: "price_low", label: "Precio menor" },
  { key: "price_high", label: "Precio mayor" },
  { key: "stock", label: "Stock" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  options: HeaderOption[];
  selectedKey: string;
  onOptionSelected: (key: string) => void;
  sortKey?: SortKey;
  onSortSelected?: (key: SortKey) => void;
  collapseOnScroll?: boolean;
  /** En lg+ los filtros viven en la columna izquierda (FilterSidebar). */
  chipsHiddenOnLarge?: boolean;
};

export function StoreHeader({ query, onQueryChange, options, selectedKey, onOptionSelected, sortKey, onSortSelected, collapseOnScroll = false, chipsHiddenOnLarge = false }: Props) {
  const [showFilters, setShowFilters] = useState(true);
  const [sortAnchor, setSortAnchor] = useState<{ left: number; top: number } | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    if (!collapseOnScroll) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 12 || y < lastY.current) setShowFilters(true);
      else if (y > lastY.current && y > 28) setShowFilters(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [collapseOnScroll]);

  const selectedSort = SORT_OPTIONS.find((o) => o.key === sortKey) ?? SORT_OPTIONS[0];

  return (
    <header className="safe-top rounded-b-[24px] bg-gradient-to-b from-store-header-top to-store-header-bottom p-3 md:rounded-none md:px-6 md:py-4">
      <div className="mx-auto max-w-[1320px]">
      <label className="flex h-14 items-center gap-2.5 rounded-full border border-store-line bg-white pl-4 pr-3 shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
        <Icon name="search" size={27} className="shrink-0 text-bosque-ink" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar o hacer una pregunta"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-bosque-ink outline-none placeholder:font-normal placeholder:text-[#5F6368]"
        />
        {query ? (
          <button type="button" onClick={() => onQueryChange("")} aria-label="Borrar búsqueda" className="grid size-8 place-items-center rounded-full text-bosque-muted">
            <Icon name="close" size={18} />
          </button>
        ) : null}
      </label>

      <div
        className={`overflow-hidden transition-all duration-[240ms] ${chipsHiddenOnLarge ? "lg:hidden" : ""}`}
        style={{ height: showFilters ? 54 : 0, opacity: showFilters ? 1 : 0, marginTop: showFilters ? 0 : -2 }}
      >
        <div className="no-scrollbar flex gap-[9px] overflow-x-auto pt-3" style={{ transform: `translateY(${showFilters ? 0 : -18}px)`, transition: "transform 240ms" }}>
          {options.map((option) =>
            option.key === "sort" && onSortSelected ? (
              <HeaderChip
                key={option.key}
                text={sortKey && sortKey !== "relevance" ? selectedSort.label : "Ordenar"}
                leading="menu"
                selected={sortKey !== "relevance"}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setSortAnchor({ left: Math.max(8, Math.min(rect.left - 12, window.innerWidth - 228)), top: rect.bottom + 4 });
                }}
              />
            ) : (
              <HeaderChip
                key={option.key}
                text={option.text}
                leading={option.leading}
                selected={option.key === selectedKey}
                onClick={() => onOptionSelected(option.key)}
              />
            ),
          )}
        </div>
      </div>

      </div>
      {sortAnchor && onSortSelected ? (
        <div className="fixed inset-0 z-40" onClick={() => setSortAnchor(null)} role="presentation">
          <div
            style={{ left: sortAnchor.left, top: sortAnchor.top }}
            className="absolute w-[220px] rounded-[22px] border border-white/80 bg-gradient-to-b from-store-header-top via-[#F9FFF5] to-store-header-bottom p-2 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="menu"
          >
            <p className="px-2.5 py-1.5 text-[12px] font-black text-bosque-muted">Ordenar productos</p>
            {SORT_OPTIONS.map((option) => {
              const selected = option.key === sortKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setSortAnchor(null);
                    onSortSelected(option.key);
                  }}
                  className={`mb-1.5 flex w-full items-center gap-[9px] rounded-[15px] border px-[11px] py-2.5 text-left ${
                    selected ? "border-store-link/45 bg-white" : "border-transparent bg-white/50"
                  }`}
                >
                  <span className={`grid size-[18px] place-items-center rounded-full border ${selected ? "border-store-link bg-store-link" : "border-bosque-border bg-white/70"}`}>
                    {selected ? <span className="size-1.5 rounded-full bg-store-yellow" /> : null}
                  </span>
                  <span className={`text-[14px] ${selected ? "font-black text-bosque-deep" : "font-bold text-bosque-ink"}`}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** HeaderChip() */
function HeaderChip({ text, leading, selected, onClick }: { text: string; leading?: IconName; selected: boolean; onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[42px] shrink-0 items-center gap-1.5 rounded-full border px-[13px] text-[15px] font-bold text-bosque-ink ${
        selected ? "border-store-link bg-white" : "border-transparent bg-white/60"
      }`}
    >
      {leading ? <Icon name={leading} size={20} /> : null}
      {text}
    </button>
  );
}

/** AccountHeader() */
export function AccountHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="safe-top rounded-b-[20px] bg-gradient-to-b from-store-header-top to-store-header-bottom px-[18px] py-3.5 md:rounded-none md:px-6 md:py-6">
      <div className="mx-auto max-w-[1320px]">
      <h1 className="text-[28px] font-black text-bosque-ink">Cuenta</h1>
      <p className="text-[12px] font-bold text-bosque-muted">{signedIn ? "Tu espacio Zeta Dorada" : "Pedidos, direcciones y preferencias"}</p>
      </div>
    </header>
  );
}

/** AccountTabRow() */
export function AccountTabRow({ options, selectedKey, onSelected }: { options: HeaderOption[]; selectedKey: string; onSelected: (key: string) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((option) => {
        const selected = option.key === selectedKey;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelected(option.key)}
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-[14px] border px-[13px] text-[13px] font-black ${
              selected ? "border-bosque-deep bg-bosque-deep text-white" : "border-bosque-border bg-white/90 text-bosque-ink"
            }`}
          >
            {option.leading ? <Icon name={option.leading} size={18} className={selected ? "text-white" : "text-store-link"} /> : null}
            {option.text}
          </button>
        );
      })}
    </div>
  );
}
