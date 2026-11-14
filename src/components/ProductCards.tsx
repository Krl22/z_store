import type { Product } from "@/lib/types";
import { Badge, PriceBlock, ProductImage, YellowButton } from "./ui";

/** DealTile(): tarjeta chica para ofertas, relacionados y recompras. */
export function DealTile({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[152px] shrink-0 flex-col rounded-[18px] border border-bosque-border bg-white p-2.5 text-left"
    >
      <ProductImage product={product} className="h-[118px] w-full" />
      <p className="mt-2 line-clamp-2 text-[13px] font-black text-bosque-ink">{product.name}</p>
      <PriceBlock product={product} priceSize={18} originalSize={11} />
    </button>
  );
}

/** ProductRow(): tarjeta grande del listado de resultados. */
export function ProductRow({ product, quantity, onOpen, onAdd }: { product: Product; quantity: number; onOpen: () => void; onAdd: () => void }) {
  const soldOut = product.stock <= 0;
  const maxed = quantity >= product.stock;
  return (
    <article
      onClick={onOpen}
      className="flex cursor-pointer gap-3 rounded-[22px] border border-bosque-border bg-white p-3 shadow-[0_2px_6px_rgba(0,0,0,0.10)]"
    >
      <ProductImage product={product} className="h-[146px] w-[120px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap gap-1.5">
          {product.tag ? <Badge text={product.tag} color={product.accent_hex} textColor={product.color_hex} /> : null}
          <Badge text={soldOut ? "Agotado" : `Stock ${product.stock}`} color="#EEF4D8" textColor="#284B2E" />
        </div>
        <h3 className="mt-[7px] line-clamp-2 text-[18px] font-black leading-[22px] text-bosque-ink">{product.name}</h3>
        {product.format ? <p className="text-[13px] font-bold text-bosque-muted">{product.format}</p> : null}
        {product.latin_name ? <p className="truncate text-[12px] italic text-store-rating">{product.latin_name}</p> : null}
        <div className="mt-2">
          <PriceBlock product={product} priceSize={25} originalSize={12} />
        </div>
        <p className="text-[12px] font-bold text-bosque-deep">Delivery en Lima - Recojo disponible</p>
        <div onClick={(event) => event.stopPropagation()} className="mt-2.5 self-start">
          <YellowButton onClick={onAdd} disabled={soldOut || maxed} className="h-[42px] px-4 text-[14px]">
            {soldOut ? "Agotado" : quantity > 0 ? `Agregar otro (${quantity})` : "Agregar al carrito"}
          </YellowButton>
        </div>
      </div>
    </article>
  );
}
