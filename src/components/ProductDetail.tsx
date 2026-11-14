import { useEffect, useState } from "react";
import { productDescription, productUsageCopy, productWarningCopy } from "@/lib/copy";
import { productImages } from "@/lib/format";
import type { Product } from "@/lib/types";
import { DealTile } from "./ProductCards";
import { Badge, Modal, PriceBlock, ProductImage, SectionTitle, SoftButton, YellowButton } from "./ui";

// ProductDetailDialog(): galería, precio, ficha, modo de uso, advertencias y relacionados.

type Props = {
  product: Product;
  related: Product[];
  quantity: number;
  onClose: () => void;
  onAdd: () => void;
  onRelated: (product: Product) => void;
};

export function ProductDetail({ product, related, quantity, onClose, onAdd, onRelated }: Props) {
  const images = productImages(product);
  const [selected, setSelected] = useState(images[0] ?? "");
  useEffect(() => setSelected(productImages(product)[0] ?? ""), [product]);
  const warnings = productWarningCopy(product);
  const soldOut = product.stock <= 0;

  return (
    <Modal onClose={onClose} labelledBy="product-title" wide className="flex flex-col gap-3.5 p-3.5 md:gap-5 md:p-6">
      <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 md:gap-6">
      <div className="flex flex-col gap-3.5">
      <div className="relative">
        <ProductImage product={product} url={selected} className="h-[292px] w-full md:h-[400px]" />
        {product.tag ? <Badge text={product.tag} color={product.accent_hex} textColor={product.color_hex} className="absolute left-3 top-3" /> : null}
      </div>
      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((image) => (
            <button key={image} type="button" onClick={() => setSelected(image)} className="shrink-0" aria-label="Ver imagen">
              <ProductImage
                product={product}
                url={image}
                className={`size-[62px] rounded-[14px] border-2 ${image === selected ? "border-bosque-warmth" : "border-bosque-border"}`}
              />
            </button>
          ))}
        </div>
      ) : null}
      </div>

      <div className="flex flex-col gap-[7px] md:justify-center">
        <h2 id="product-title" className="text-[24px] font-black leading-[27px] text-bosque-ink">
          {product.name}
        </h2>
        <p className="text-[13px] font-bold text-bosque-muted">{product.latin_name?.trim() || product.format}</p>
        <p className="text-[12px] font-bold text-store-rating">{soldOut ? "Agotado por ahora" : `Stock ${product.stock}`}</p>
        <PriceBlock product={product} priceSize={32} originalSize={14} />
        <p className="text-[14px] leading-5 text-bosque-ink">{productDescription(product)}</p>
        <div className="mt-3 hidden gap-2.5 md:flex">
          <YellowButton onClick={onAdd} disabled={soldOut || quantity >= product.stock} className="h-12 flex-1 !rounded-[16px]">
            {soldOut ? "Agotado" : quantity > 0 ? `Agregar otro (${quantity})` : "Agregar al carrito"}
          </YellowButton>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniMetric label="Formato" value={product.format?.trim() || product.category} />
        <MiniMetric label="Categoría" value={product.category} />
        <MiniMetric label="Entrega" value="Lima" />
      </div>

      <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 md:items-start">
        <DetailSection title="Modo de uso sugerido" items={productUsageCopy(product)} />
        {warnings.length ? <DetailSection title="Advertencias" items={warnings} warning /> : null}
      </div>

      {related.length ? (
        <div className="flex flex-col gap-2.5">
          <SectionTitle title="Relacionados" detail={`${related.length} opciones`} />
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
            {related.map((item) => (
              <DealTile key={item.id} product={item} onClick={() => onRelated(item)} />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-[12px] text-bosque-muted">Pagas con Yape al confirmar tu pedido por WhatsApp.</p>
      <div className="flex gap-2.5">
        <SoftButton onClick={onClose} className="h-12 flex-1 rounded-[16px]">
          Cerrar
        </SoftButton>
        <YellowButton onClick={onAdd} disabled={soldOut || quantity >= product.stock} className="h-12 flex-1 !rounded-[16px]">
          {soldOut ? "Agotado" : quantity > 0 ? `Agregar otro (${quantity})` : "Agregar"}
        </YellowButton>
      </div>
    </Modal>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[16px] border border-bosque-border bg-white p-2.5">
      <span className="truncate text-[10px] font-bold text-bosque-muted">{label}</span>
      <span className="line-clamp-2 text-[12px] font-black text-bosque-ink">{value}</span>
    </div>
  );
}

function DetailSection({ title, items, warning = false }: { title: string; items: string[]; warning?: boolean }) {
  return (
    <div className={`flex flex-col gap-[9px] rounded-[18px] border p-[13px] ${warning ? "border-[#E6C88D] bg-[#FFF6E8]" : "border-bosque-border bg-white"}`}>
      <h3 className="text-[16px] font-black text-bosque-ink">{title}</h3>
      {items.map((item) => (
        <div key={item} className="flex gap-2">
          <span className={`font-black ${warning ? "text-bosque-warmth" : "text-store-link"}`}>{warning ? "!" : "+"}</span>
          <p className="flex-1 text-[13px] leading-[18px] text-bosque-ink">{item}</p>
        </div>
      ))}
    </div>
  );
}
