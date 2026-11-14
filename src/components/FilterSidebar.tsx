import type { ReactNode } from "react";
import { SORT_OPTIONS, type SortKey } from "./StoreHeader";

// Filtros de la columna izquierda en escritorio (en el celular siguen como chips del encabezado).

export type ProductFilters = {
  category: string;
  sortKey: SortKey;
  minPrice: string;
  maxPrice: string;
  onlyStock: boolean;
  onlyOffers: boolean;
};

export const DEFAULT_FILTERS: ProductFilters = { category: "Todos", sortKey: "relevance", minPrice: "", maxPrice: "", onlyStock: false, onlyOffers: false };

type Props = {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  categories: { name: string; count: number }[];
  resultCount: number;
};

export function FilterSidebar({ filters, onChange, categories, resultCount }: Props) {
  const set = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => onChange({ ...filters, [key]: value });
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <aside className="flex flex-col gap-5 rounded-[24px] border border-bosque-border bg-white p-5" aria-label="Filtros">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-black text-bosque-ink">Filtros</h2>
        <span className="text-[12px] font-bold text-bosque-muted">{resultCount === 1 ? "1 producto" : `${resultCount} productos`}</span>
      </div>

      <Group title="Categorías">
        {categories.map((c) => {
          const active = filters.category === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => set("category", c.name)}
              className={`flex items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-[15px] ${active ? "bg-store-mint font-black text-store-link" : "font-bold text-bosque-ink hover:bg-bosque-soft"}`}
            >
              {c.name}
              <span className={`text-[12px] ${active ? "text-store-link" : "text-bosque-muted"}`}>{c.count}</span>
            </button>
          );
        })}
      </Group>

      <Group title="Ordenar por">
        {SORT_OPTIONS.map((option) => {
          const selected = filters.sortKey === option.key;
          return (
            <button key={option.key} type="button" onClick={() => set("sortKey", option.key)} className="flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-left hover:bg-bosque-soft">
              <span className={`grid size-[18px] place-items-center rounded-full border ${selected ? "border-store-link bg-store-link" : "border-bosque-border bg-white"}`}>
                {selected ? <span className="size-1.5 rounded-full bg-store-yellow" /> : null}
              </span>
              <span className={`text-[14px] ${selected ? "font-black text-bosque-deep" : "font-bold text-bosque-ink"}`}>{option.label}</span>
            </button>
          );
        })}
      </Group>

      <Group title="Precio (S/)">
        <div className="flex items-center gap-2 px-1">
          <PriceInput label="Mínimo" value={filters.minPrice} onChange={(v) => set("minPrice", v)} />
          <span className="text-bosque-muted">–</span>
          <PriceInput label="Máximo" value={filters.maxPrice} onChange={(v) => set("maxPrice", v)} />
        </div>
      </Group>

      <Group title="Más filtros">
        <Check label="Solo con stock" checked={filters.onlyStock} onChange={(v) => set("onlyStock", v)} />
        <Check label="Solo en oferta" checked={filters.onlyOffers} onChange={(v) => set("onlyOffers", v)} />
      </Group>

      {dirty ? (
        <button type="button" onClick={() => onChange(DEFAULT_FILTERS)} className="h-11 rounded-full border border-store-line bg-white text-[14px] font-black text-bosque-ink">
          Limpiar filtros
        </button>
      ) : null}
    </aside>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="mb-1 text-[12px] font-black uppercase tracking-wide text-bosque-muted">{title}</h3>
      {children}
    </section>
  );
}

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
      inputMode="numeric"
      placeholder={label}
      aria-label={`Precio ${label.toLowerCase()}`}
      className="h-10 w-full min-w-0 rounded-[12px] border border-bosque-border bg-bosque-soft px-3 text-[14px] font-bold text-bosque-ink outline-none focus:border-store-link"
    />
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-[14px] px-3 py-2 hover:bg-bosque-soft">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-[18px] accent-[#2F6F46]" />
      <span className="text-[14px] font-bold text-bosque-ink">{label}</span>
    </label>
  );
}
