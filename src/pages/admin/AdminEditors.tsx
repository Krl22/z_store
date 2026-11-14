import { useState, type ReactNode } from "react";
import { Modal, RemoteImage } from "@/components/ui";
import * as api from "@/lib/api";
import type { HomePromo, Product } from "@/lib/types";
import { AdminButton, AdminToggle } from "./AdminUi";

// AdminPanelDialog() y HomePromoAdminDialog() de MainActivity.kt.

const COLOR_OPTIONS = [
  { name: "Verde bosque", color: "#426B35", accent: "#DCEBB1" },
  { name: "Reishi tierra", color: "#B56B47", accent: "#F7D7BF" },
  { name: "Dorado melena", color: "#D7A13B", accent: "#F8E4B2" },
  { name: "Vital coral", color: "#C85D3C", accent: "#F5C5AF" },
  { name: "Menta clara", color: "#2F6F46", accent: "#EAF7EA" },
];

const PROMO_PALETTES = [
  { name: "Bosque natural", colors: ["#234428", "#5F7E3F", "#E7C56B"] },
  { name: "Tierra cálida", colors: ["#44291F", "#8A5A36", "#E8B967"] },
  { name: "Menta herbal", colors: ["#1E3B45", "#3F755D", "#D8E7B5"] },
  { name: "Verde suave", colors: ["#284B2E", "#2F6F46", "#DCEBB1"] },
];

const DEFAULT_CATEGORIES = ["Tinturas", "Capsulas", "Polvos", "Kits"];

export const slugFrom = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Mn}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "nuevo-producto";

export function emptyProduct(displayOrder: number): Product {
  return {
    id: "",
    name: "",
    latin_name: "",
    format: "",
    category: "Kits",
    price: 0,
    offer_price: null,
    is_featured_offer: false,
    tag: "Nuevo",
    rating: 4.8,
    color_hex: "#426B35",
    accent_hex: "#DCEBB1",
    benefits: [],
    stock: 0,
    image_keys: [],
    image_urls: [],
    is_active: true,
    display_order: displayOrder,
  };
}

export function emptyPromo(displayOrder: number): HomePromo {
  return {
    id: "",
    eyebrow: "",
    title: "",
    detail: "",
    color_hexes: PROMO_PALETTES[0]!.colors,
    image_key: "",
    image_url: "",
    display_order: displayOrder,
    is_active: true,
  };
}

function Field({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "numeric" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-bold text-bosque-muted">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-[14px] border border-bosque-border bg-bosque-soft px-3 text-[15px] font-bold text-bosque-ink outline-none focus:border-store-link"
      />
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[16px] font-black text-bosque-ink">{title}</h3>
      {children}
    </section>
  );
}

function Choice({ label, selected, onClick, swatch }: { label: string; selected: boolean; onClick: () => void; swatch?: string[] }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-black ${selected ? "border-bosque-deep bg-bosque-deep text-white" : "border-bosque-border bg-white text-bosque-ink"}`}
    >
      {swatch ? <span className="h-4 w-8 rounded-full border border-white/60" style={{ background: `linear-gradient(90deg, ${swatch.join(", ")})` }} /> : null}
      {label}
    </button>
  );
}

function ImagesEditor({ urls, onChange, folder, slug, single = false }: { urls: string[]; onChange: (urls: string[]) => void; folder: "products" | "promos"; slug: string; single?: boolean }) {
  const [manual, setManual] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, single ? 1 : 6)) uploaded.push(await api.uploadStoreImage(file, folder, slug || "nuevo"));
      onChange(single ? uploaded.slice(0, 1) : [...urls, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {urls.length ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {urls.map((url, index) => (
            <div key={url} className="relative shrink-0">
              <RemoteImage url={url} alt="" className="size-20 rounded-[14px] border border-bosque-border" />
              {index === 0 && !single ? <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 text-[10px] font-black text-bosque-deep">Principal</span> : null}
              <button
                type="button"
                onClick={() => onChange(urls.filter((u) => u !== url))}
                className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-white text-[12px] font-black text-[#B42318] shadow"
                aria-label="Quitar imagen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-bosque-muted">Sin imágenes todavía.</p>
      )}
      <label className={`flex h-12 cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-store-link bg-store-mint text-[14px] font-black text-store-link ${uploading ? "opacity-60" : ""}`}>
        {uploading ? "Subiendo…" : single ? "Subir imagen" : "Subir imágenes"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={!single} className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
      </label>
      <div className="flex gap-2">
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="o pega una URL https://…"
          className="h-11 min-w-0 flex-1 rounded-[14px] border border-bosque-border bg-bosque-soft px-3 text-[14px] text-bosque-ink outline-none"
        />
        <AdminButton
          variant="outline"
          disabled={!/^https?:\/\//.test(manual.trim())}
          onClick={() => {
            onChange(single ? [manual.trim()] : [...urls, manual.trim()]);
            setManual("");
          }}
        >
          Agregar
        </AdminButton>
      </div>
      {error ? <p className="text-[12px] font-bold text-[#B42318]">{error}</p> : null}
      <p className="text-[11px] text-bosque-muted">JPG, PNG, WebP o GIF de hasta 5 MB.</p>
    </div>
  );
}

export function ProductEditor({
  initial,
  categories,
  onClose,
  onSave,
  onDelete,
}: {
  initial: Product;
  categories: string[];
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  onDelete: (product: Product) => void;
}) {
  const isNew = !initial.id;
  const [p, setP] = useState<Product>(initial);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [offer, setOffer] = useState(initial.offer_price ? String(initial.offer_price) : "");
  const [stock, setStock] = useState(String(initial.stock));
  const [position, setPosition] = useState(String(initial.display_order));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allCategories = [...new Set([...categories, ...DEFAULT_CATEGORIES])];
  const set = <K extends keyof Product>(key: K, value: Product[K]) => setP((prev) => ({ ...prev, [key]: value }));
  const slug = isNew ? slugFrom(p.name) : p.id;

  async function save() {
    const basePrice = Number.parseInt(price, 10);
    const offerPrice = offer.trim() ? Number.parseInt(offer, 10) : null;
    if (!p.name.trim()) return setError("Escribe el nombre del producto.");
    if (!Number.isFinite(basePrice) || basePrice <= 0) return setError("El precio debe ser mayor a 0.");
    if (offerPrice != null && (!Number.isFinite(offerPrice) || offerPrice <= 0 || offerPrice >= basePrice)) return setError("El precio de oferta debe ser menor al precio normal.");
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...p,
        id: slug,
        name: p.name.trim(),
        price: basePrice,
        offer_price: offerPrice,
        stock: Math.max(0, Number.parseInt(stock, 10) || 0),
        display_order: Number.parseInt(position, 10) || 0,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} className="flex flex-col gap-5 p-4">
      <div className="flex items-center justify-between gap-3 rounded-[22px] bg-gradient-to-br from-[#173B25] via-[#285C38] to-[#E3C044] p-4 text-white">
        <div>
          <p className="text-[22px] font-black">{isNew ? "Nuevo producto" : "Editar producto"}</p>
          <p className="text-[12px] font-bold text-[#F6EFC8]">Solo visible para usuarios admin</p>
        </div>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-white/20 font-black" aria-label="Cerrar">
          ✕
        </button>
      </div>

      <FormSection title="Información principal">
        <Field label="Nombre del producto" value={p.name} onChange={(v) => set("name", v)} />
        {isNew ? <p className="-mt-2 text-[11px] text-bosque-muted">ID: {slug}</p> : null}
        <Field label="Nombre botánico o descripción corta" value={p.latin_name ?? ""} onChange={(v) => set("latin_name", v)} />
        <Field label="Presentación" value={p.format ?? ""} onChange={(v) => set("format", v)} />
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-bosque-muted">Categoría</span>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((c) => (
              <Choice key={c} label={c} selected={p.category === c} onClick={() => set("category", c)} />
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="Precio y stock">
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Precio S/" value={price} onChange={(v) => setPrice(v.replace(/\D/g, ""))} inputMode="numeric" />
          <Field label="Precio oferta S/" value={offer} onChange={(v) => setOffer(v.replace(/\D/g, ""))} inputMode="numeric" />
          <Field label="Stock" value={stock} onChange={(v) => setStock(v.replace(/\D/g, ""))} inputMode="numeric" />
          <Field label="Posición" value={position} onChange={(v) => setPosition(v.replace(/\D/g, ""))} inputMode="numeric" />
        </div>
        <Field label="Etiqueta visible" value={p.tag ?? ""} onChange={(v) => set("tag", v)} />
        <AdminToggle title="Visible en la tienda" description="Si lo apagas, el producto queda oculto para los clientes." checked={p.is_active} enabled onChange={(v) => set("is_active", v)} />
        <AdminToggle title="Oferta destacada" description="Aparece en «Ofertas destacadas» del inicio." checked={p.is_featured_offer} enabled onChange={(v) => set("is_featured_offer", v)} />
      </FormSection>

      <FormSection title="Color del producto">
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((option) => (
            <Choice
              key={option.name}
              label={option.name}
              swatch={[option.color, option.accent]}
              selected={p.color_hex.toUpperCase() === option.color}
              onClick={() => setP((prev) => ({ ...prev, color_hex: option.color, accent_hex: option.accent }))}
            />
          ))}
        </div>
      </FormSection>

      <FormSection title="Imágenes del producto">
        <ImagesEditor urls={p.image_urls} onChange={(urls) => set("image_urls", urls)} folder="products" slug={slug} />
      </FormSection>

      {error ? <p className="rounded-[14px] bg-[#FFEDE9] p-3 text-[13px] font-bold text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2.5">
        {!isNew ? (
          <AdminButton variant="danger" onClick={() => onDelete(initial)} className="flex-1">
            Eliminar
          </AdminButton>
        ) : null}
        <AdminButton onClick={save} disabled={saving} className="flex-[2]">
          {saving ? "Guardando…" : "Guardar"}
        </AdminButton>
      </div>
    </Modal>
  );
}

export function PromoEditor({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial: HomePromo;
  onClose: () => void;
  onSave: (promo: HomePromo) => Promise<void>;
  onDelete: (promo: HomePromo) => void;
}) {
  const isNew = !initial.id;
  const [promo, setPromo] = useState<HomePromo>(initial);
  const [position, setPosition] = useState(String(initial.display_order));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof HomePromo>(key: K, value: HomePromo[K]) => setPromo((prev) => ({ ...prev, [key]: value }));
  const id = isNew ? slugFrom(promo.title).slice(0, 40) : promo.id;

  async function save() {
    if (!promo.title.trim()) return setError("Escribe el título del anuncio.");
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...promo, id, title: promo.title.trim(), display_order: Number.parseInt(position, 10) || 0 });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el anuncio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} className="flex flex-col gap-5 p-4">
      <div className="flex items-center justify-between gap-3 rounded-[22px] p-4 text-white" style={{ background: `linear-gradient(135deg, ${promo.color_hexes.join(", ")})` }}>
        <div className="min-w-0">
          <p className="text-[12px] font-black text-[#FFF8E8]">{promo.eyebrow || "Editar home"}</p>
          <p className="line-clamp-2 text-[22px] font-black">{promo.title || "Anuncio del carrusel principal"}</p>
          <p className="truncate text-[12px] text-[#FFF8E8]">{promo.detail}</p>
        </div>
        <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20 font-black" aria-label="Cerrar">
          ✕
        </button>
      </div>
      <FormSection title="Contenido del anuncio">
        <Field label="Etiqueta pequeña" value={promo.eyebrow} onChange={(v) => set("eyebrow", v)} />
        <Field label="Título" value={promo.title} onChange={(v) => set("title", v)} />
        <Field label="Detalle" value={promo.detail} onChange={(v) => set("detail", v)} />
        <Field label="Posición en el carrusel" value={position} onChange={(v) => setPosition(v.replace(/\D/g, ""))} inputMode="numeric" />
        <AdminToggle title="Visible en el inicio" description="Si lo apagas, deja de aparecer en el carrusel." checked={promo.is_active} enabled onChange={(v) => set("is_active", v)} />
      </FormSection>
      <FormSection title="Colores">
        <div className="flex flex-wrap gap-2">
          {PROMO_PALETTES.map((palette) => (
            <Choice
              key={palette.name}
              label={palette.name}
              swatch={palette.colors}
              selected={palette.colors.join() === promo.color_hexes.join()}
              onClick={() => set("color_hexes", palette.colors)}
            />
          ))}
        </div>
      </FormSection>
      <FormSection title="Imagen del anuncio">
        <ImagesEditor urls={promo.image_url ? [promo.image_url] : []} onChange={(urls) => set("image_url", urls[0] ?? "")} folder="promos" slug={id || "anuncio"} single />
      </FormSection>
      {error ? <p className="rounded-[14px] bg-[#FFEDE9] p-3 text-[13px] font-bold text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2.5">
        {!isNew ? (
          <AdminButton variant="danger" onClick={() => onDelete(initial)} className="flex-1">
            Eliminar anuncio
          </AdminButton>
        ) : null}
        <AdminButton onClick={save} disabled={saving} className="flex-[2]">
          {saving ? "Guardando…" : "Guardar"}
        </AdminButton>
      </div>
    </Modal>
  );
}
