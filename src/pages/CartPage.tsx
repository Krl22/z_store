import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { DealTile } from "@/components/ProductCards";
import { StoreHeader, type HeaderOption } from "@/components/StoreHeader";
import {
  AccountLine,
  ActionChip,
  CheckoutLine,
  EmptyStateCard,
  Modal,
  PriceBlock,
  ProductImage,
  SectionTitle,
  SoftButton,
  StatusBadge,
  StatusPill,
  YellowButton,
} from "@/components/ui";
import * as api from "@/lib/api";
import { formatSoles, orderCode } from "@/lib/format";
import type { Address, Product } from "@/lib/types";
import { useStore } from "@/state/StoreContext";

// CartScreen(): pestañas Carrito / Listas / Recomprar / Seguir comprando y checkout por WhatsApp.

const CART_OPTIONS: HeaderOption[] = [
  { key: "cart", text: "Carrito", leading: "cart" },
  { key: "lists", text: "Listas" },
  { key: "buy_again", text: "Recomprar" },
  { key: "keep_shopping", text: "Seguir comprando" },
];

type CheckoutSuccess = { code: string; itemCount: number; total: number; whatsappUrl: string | null };

export function CartPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("cart");
  const [query, setQuery] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [confirming, setConfirming] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);

  const cartProducts = store.products.filter((p) => (store.cart[p.id] ?? 0) > 0);
  const savedProducts = store.products.filter((p) => store.saved.has(p.id));
  const totalItems = store.cartCount;
  const checkoutPhone = store.profile?.phone?.trim() || store.defaultAddress?.phone?.trim() || "";

  const purchased = useMemo(() => {
    const ids = new Set(store.orders.flatMap((o) => o.order_items.map((i) => i.product_id)));
    return store.products.filter((p) => ids.has(p.id));
  }, [store.orders, store.products]);

  function requestCheckout() {
    if (!store.session) {
      store.setMessage("Inicia sesión para completar tu pedido.");
      navigate("/perfil");
      return;
    }
    if (totalItems === 0) {
      store.setMessage("Agrega productos antes de hacer tu pedido.");
      return;
    }
    if (!checkoutPhone) {
      store.setMessage("Agrega un número de teléfono en Cuenta antes de confirmar tu pedido.");
      navigate("/perfil");
      return;
    }
    if (deliveryMethod === "delivery" && !store.defaultAddress) {
      store.setMessage("Completa tus datos de entrega antes de confirmar. También puedes elegir recojo en el carrito.");
      navigate("/perfil");
      return;
    }
    setConfirming(true);
  }

  async function checkout() {
    setCheckingOut(true);
    setConfirming(false);
    store.setMessage("Reservando stock de tu pedido...");
    try {
      const addressId = deliveryMethod === "delivery" ? store.profile?.default_address_id ?? store.defaultAddress?.id ?? null : null;
      const items = cartProducts.map((p) => ({ product_id: p.id, product_name: p.name, quantity: store.cart[p.id] ?? 1 }));
      const orderId = await api.createOrder(items, addressId, addressId ? "delivery" : "pickup");
      const order = await api.fetchOrder(orderId);
      // El pedido ya existe; si falla el link de WhatsApp, se puede reenviar desde Perfil > Pedidos.
      const whatsappUrl = await api.fetchOrderWhatsappUrl(orderId).catch(() => null);
      await store.clearCart(cartProducts.map((p) => p.id));
      await Promise.all([store.refreshCatalog(), store.refreshOrders()]);
      setSuccess({
        code: orderCode(orderId),
        itemCount: order?.order_items.reduce((s, i) => s + i.quantity, 0) ?? totalItems,
        total: order?.total ?? store.subtotal,
        whatsappUrl,
      });
      if (whatsappUrl) window.open(whatsappUrl, "_blank", "noopener");
      store.setMessage("Pedido registrado. Confírmalo por WhatsApp para coordinar el pago.");
    } catch (error) {
      store.setMessage(error instanceof Error ? `Pedido no completado: ${error.message}` : "No pudimos completar el pedido. Intenta nuevamente en un momento.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-3.5 pb-28 md:pb-12">
      <StoreHeader
        query={query}
        onQueryChange={(value) => {
          setQuery(value);
          if (value) navigate("/");
        }}
        options={CART_OPTIONS}
        selectedKey={tab}
        onOptionSelected={setTab}
      />

      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-3.5 md:px-6 md:pt-2">
      {store.message ? (
        <div className="px-3.5 md:px-0">
          <StatusPill message={store.message} onDismiss={() => store.setMessage(null)} />
        </div>
      ) : null}

      {tab === "cart" ? (
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col lg:hidden">
          <CheckoutSummary
            itemCount={totalItems}
            subtotal={store.subtotal}
            address={store.defaultAddress}
            deliveryMethod={deliveryMethod}
            hasItems={cartProducts.length > 0}
            checkingOut={checkingOut}
            onCheckout={requestCheckout}
            onShop={() => navigate("/")}
          />
          </div>
          {cartProducts.length === 0 ? (
            <EmptyStateCard
              className="mx-3.5 md:mx-0"
              title="Tu carrito está vacío"
              detail="Agrega productos desde el inicio para ver el resumen y pedir por WhatsApp."
              action="Seguir comprando"
              onAction={() => navigate("/")}
            />
          ) : (
            <>
              <DeliveryMethodPicker selected={deliveryMethod} onSelected={setDeliveryMethod} />
              <PaymentMethodCard />
              <DeliveryAddressCard address={store.defaultAddress} deliveryMethod={deliveryMethod} />
              {cartProducts.map((product) => (
                <CartItem
                  key={product.id}
                  product={product}
                  quantity={store.cart[product.id] ?? 0}
                  onAdd={() => store.addToCart(product)}
                  onRemove={() => store.removeFromCart(product)}
                  onDelete={() => store.deleteFromCart(product)}
                  onSave={async () => {
                    if (!(await store.saveForLater(product))) navigate("/perfil");
                  }}
                />
              ))}
              <div className="flex flex-col lg:hidden">
              <CheckoutSummary
                itemCount={totalItems}
                subtotal={store.subtotal}
                address={store.defaultAddress}
                deliveryMethod={deliveryMethod}
                hasItems
                checkingOut={checkingOut}
                onCheckout={requestCheckout}
                onShop={() => navigate("/")}
              />
              </div>
            </>
          )}
        </div>
        <aside className="hidden lg:sticky lg:top-24 lg:flex lg:flex-col">
          <CheckoutSummary
            itemCount={totalItems}
            subtotal={store.subtotal}
            address={store.defaultAddress}
            deliveryMethod={deliveryMethod}
            hasItems={cartProducts.length > 0}
            checkingOut={checkingOut}
            onCheckout={requestCheckout}
            onShop={() => navigate("/")}
          />
        </aside>
        </div>
      ) : null}

      {tab === "lists" ? (
        <section className="flex flex-col gap-3 bg-white px-[18px] py-4 md:rounded-[24px] md:border md:border-bosque-border">
          <SectionTitle title="Guardado para después" detail={`${savedProducts.length} productos`} />
          {savedProducts.length === 0 ? (
            <>
              <p className="text-[13px] text-bosque-muted">{store.session ? "Todavía no guardaste productos." : "Inicia sesión para guardar productos."}</p>
              <div>
                <ActionChip text="Explorar productos" onClick={() => navigate("/")} />
              </div>
            </>
          ) : (
            savedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-2.5 rounded-[18px] bg-bosque-soft p-2.5">
                <ProductImage product={product} className="size-[74px] shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                  <p className="line-clamp-2 font-black text-bosque-ink">{product.name}</p>
                  <PriceBlock product={product} priceSize={15} originalSize={10} />
                  <div className="flex flex-wrap gap-2">
                    <ActionChip text="Mover al carrito" onClick={() => store.moveSavedToCart(product)} />
                    <ActionChip text="Quitar" onClick={() => store.removeSaved(product)} />
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      ) : null}

      {tab === "buy_again" ? (
        <section className="flex flex-col gap-3 bg-white px-[18px] py-4 md:rounded-[24px] md:border md:border-bosque-border">
          <SectionTitle title="Comprar otra vez" detail={`${purchased.length} productos`} />
          {purchased.length === 0 ? (
            <>
              <p className="text-[13px] text-bosque-muted">Cuando completes un pedido, sus productos aparecerán aquí.</p>
              <div>
                <ActionChip text="Explorar productos" onClick={() => navigate("/")} />
              </div>
            </>
          ) : (
            <div className="no-scrollbar flex gap-3 overflow-x-auto">
              {purchased.map((product) => (
                <div key={product.id} className="flex w-[168px] shrink-0 flex-col gap-2 rounded-[18px] border border-bosque-border bg-bosque-soft p-2.5">
                  <ProductImage product={product} className="h-[118px] w-full" />
                  <p className="line-clamp-2 text-[13px] font-black text-bosque-ink">{product.name}</p>
                  <PriceBlock product={product} priceSize={16} originalSize={10} />
                  <div>
                    <ActionChip text="Agregar" onClick={() => store.addToCart(product)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "keep_shopping" ? (
        <>
          <section className="flex flex-col gap-3 bg-white px-[18px] py-4 md:rounded-[24px] md:border md:border-bosque-border">
            <h2 className="text-[25px] font-black text-bosque-ink">Sigue comprando</h2>
            <p className="text-[13px] text-bosque-muted">Vuelve al inicio para explorar ofertas, talleres y productos.</p>
            <YellowButton onClick={() => navigate("/")} className="h-[50px] w-full">
              Ir al inicio
            </YellowButton>
          </section>
          <section className="flex flex-col gap-3 bg-white px-[18px] py-4 md:rounded-[24px] md:border md:border-bosque-border">
            <SectionTitle title="Recomendados" detail="Delivery en Lima" />
            <div className="no-scrollbar flex gap-3 overflow-x-auto">
              {store.products.map((product) => (
                <DealTile key={product.id} product={product} onClick={() => navigate(`/producto/${product.id}`)} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      </main>

      {confirming ? (
        <Modal onClose={() => setConfirming(false)} className="flex flex-col gap-3 p-4">
          <div className="grid size-[54px] place-items-center rounded-full bg-store-mint text-store-link">
            <Icon name="cart" size={30} />
          </div>
          <h2 className="text-[24px] font-black text-bosque-ink">Confirmar pedido</h2>
          <p className="text-[13px] leading-[18px] text-bosque-muted">
            Reservamos el stock y abrimos WhatsApp con el resumen para coordinar el pago y la entrega. Tu pedido aparecerá en Perfil &gt; Pedidos.
          </p>
          <CheckoutLine label="Items" value={String(totalItems)} />
          <CheckoutLine label="Entrega" value={deliveryMethod === "pickup" ? "Recojo en tienda" : "Se coordina por WhatsApp"} />
          <CheckoutLine label="Pago" value="Yape" />
          <CheckoutLine label="Total" value={formatSoles(store.subtotal)} strong />
          <div className="flex flex-col gap-[5px] rounded-[18px] border border-bosque-border bg-white p-3">
            <p className="text-[15px] font-black text-bosque-ink">Pago con Yape</p>
            <p className="text-[12px] leading-4 text-bosque-muted">Te enviamos los datos por WhatsApp</p>
            <p className="text-[12px] font-black text-bosque-warmth">Tu pedido queda pendiente hasta confirmar el pago.</p>
          </div>
          <div className="flex gap-2.5">
            <SoftButton onClick={() => setConfirming(false)} className="h-12 flex-1 rounded-[16px]">
              Cancelar
            </SoftButton>
            <YellowButton onClick={checkout} className="h-12 flex-1 !rounded-[16px]">
              Pedir por WhatsApp
            </YellowButton>
          </div>
        </Modal>
      ) : null}

      {success ? (
        <Modal onClose={() => setSuccess(null)} className="flex flex-col items-center gap-[13px] p-[18px]">
          <div className="grid size-[72px] place-items-center rounded-full bg-gradient-to-br from-store-yellow to-bosque-strong text-[22px] font-black text-bosque-ink">OK</div>
          <h2 className="text-[25px] font-black text-bosque-ink">Pedido registrado</h2>
          <p className="text-center text-[13px] text-bosque-muted">Falta un paso: envíanos el mensaje por WhatsApp para coordinar el pago con Yape y la entrega.</p>
          <AccountLine label="Código" value={success.code} />
          <AccountLine label="Items" value={String(success.itemCount)} />
          <AccountLine label="Pago" value="Pendiente (Yape)" />
          <AccountLine label="Total" value={formatSoles(success.total)} />
          {success.whatsappUrl ? (
            <a
              href={success.whatsappUrl}
              target="_blank"
              rel="noopener"
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-store-yellow font-black text-bosque-ink"
            >
              <Icon name="whatsapp" size={20} />
              Abrir WhatsApp
            </a>
          ) : null}
          <SoftButton
            onClick={() => {
              setSuccess(null);
              navigate("/perfil?tab=pedidos");
            }}
            className="h-[50px] w-full rounded-full"
          >
            Ver mis pedidos
          </SoftButton>
          <SoftButton onClick={() => setSuccess(null)} className="h-12 w-full rounded-full">
            Cerrar
          </SoftButton>
        </Modal>
      ) : null}
    </div>
  );
}

/** CartCheckoutSummary() */
function CheckoutSummary(props: {
  itemCount: number;
  subtotal: number;
  address: Address | null;
  deliveryMethod: string;
  hasItems: boolean;
  checkingOut: boolean;
  onCheckout: () => void;
  onShop: () => void;
}) {
  const { itemCount, subtotal, address, deliveryMethod, hasItems, checkingOut } = props;
  return (
    <section className="mx-3.5 md:mx-0 flex flex-col gap-3 rounded-[24px] border border-bosque-border bg-white px-[18px] py-4">
      <SectionTitle title="Resumen" detail={hasItems ? `${itemCount} items` : "sin items"} />
      <CheckoutLine label="Subtotal" value={hasItems ? formatSoles(subtotal) : "S/ 0.00"} />
      <CheckoutLine
        label="Entrega"
        value={!hasItems ? "-" : deliveryMethod === "pickup" ? "Recojo en tienda" : !address ? "Completar datos" : "Se coordina por WhatsApp"}
      />
      <CheckoutLine label="Método de pago" value={hasItems ? "Yape" : "-"} />
      <div className="h-px bg-bosque-border/70" />
      <CheckoutLine label="Total" value={hasItems ? formatSoles(subtotal) : "S/ 0.00"} strong />
      <YellowButton onClick={hasItems ? props.onCheckout : props.onShop} disabled={checkingOut} className="h-[54px] w-full text-[17px] !font-bold">
        {checkingOut ? "Creando tu pedido..." : `Pedir por WhatsApp (${itemCount} items)`}
      </YellowButton>
      <p className="text-[12px] leading-4 text-bosque-muted">Pagas con Yape al confirmar por WhatsApp. El pedido queda visible en tu perfil.</p>
    </section>
  );
}

/** CartDeliveryMethodPicker() */
function DeliveryMethodPicker({ selected, onSelected }: { selected: string; onSelected: (method: "delivery" | "pickup") => void }) {
  const choice = (key: "delivery" | "pickup", title: string, detail: string) => {
    const active = selected === key;
    return (
      <button
        type="button"
        onClick={() => onSelected(key)}
        className={`flex h-[72px] flex-1 flex-col justify-center rounded-[14px] border px-3 py-2.5 text-left ${active ? "border-store-link bg-store-mint" : "border-bosque-border bg-bosque-soft"}`}
      >
        <span className="truncate text-[15px] font-black text-bosque-ink">{title}</span>
        <span className={`truncate text-[11px] font-bold ${active ? "text-store-link" : "text-bosque-muted"}`}>{detail}</span>
      </button>
    );
  };
  return (
    <div className="mx-3.5 md:mx-0 flex gap-2 rounded-[18px] border border-bosque-border bg-white p-2">
      {choice("delivery", "Delivery", "Enviar a dirección")}
      {choice("pickup", "Retiro", "Recojo en tienda")}
    </div>
  );
}

/** CartPaymentMethodPicker() con Yape como único método. */
function PaymentMethodCard() {
  return (
    <div className="mx-3.5 md:mx-0 flex flex-col gap-2.5 rounded-[20px] border border-bosque-border bg-white p-3">
      <SectionTitle title="Pago" detail="Yape" />
      <div className="flex h-[78px] w-1/2 min-w-[180px] items-center gap-[9px] rounded-[16px] border border-store-link bg-store-mint p-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-bosque-warmth bg-store-yellow text-[11px] font-black text-bosque-ink">QR</span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] font-black text-bosque-ink">Yape</span>
          <span className="text-[10px] leading-[13px] text-store-link">Te enviamos los datos por WhatsApp</span>
        </span>
      </div>
      <p className="text-[11px] leading-[15px] text-bosque-muted">Al confirmar, abrimos WhatsApp con tu pedido y ahí coordinamos el pago con Yape.</p>
    </div>
  );
}

/** CartDeliveryAddressCard() */
function DeliveryAddressCard({ address, deliveryMethod }: { address: Address | null; deliveryMethod: string }) {
  const pickup = deliveryMethod === "pickup";
  return (
    <div className="mx-3.5 md:mx-0 flex items-center gap-3 rounded-[18px] border border-bosque-border bg-white p-3.5">
      <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-store-mint text-store-link">
        <Icon name="pin" size={24} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <p className="truncate text-[15px] font-black text-bosque-ink">
          {pickup ? "Recojo en tienda" : !address ? "Falta dirección de entrega" : `Enviar a ${address.recipient_name || "cliente"}`}
        </p>
        <p className="line-clamp-2 text-[12px] leading-[15px] text-bosque-muted">
          {pickup
            ? "No necesitas dirección. Coordinamos el recojo por WhatsApp."
            : !address
              ? "Completa Perfil > Cuenta > Direcciones para continuar con delivery."
              : `${address.line1}, ${address.district}`}
        </p>
      </div>
      <StatusBadge text={pickup ? "Retiro" : "Delivery"} active />
    </div>
  );
}

/** AmazonCartItem(), sin datos inventados ("100+ interesados"). */
function CartItem({
  product,
  quantity,
  onAdd,
  onRemove,
  onDelete,
  onSave,
}: {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex gap-3 bg-bosque-soft px-[18px] py-3.5 md:rounded-[22px] md:border md:border-bosque-border">
      <ProductImage product={product} className="size-[126px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="line-clamp-3 text-[18px] leading-[21px] text-bosque-ink">
          {product.name}
          {product.format ? ` - ${product.format}` : ""}
        </p>
        <p className="text-[13px] font-bold text-bosque-muted">by ZETA DORADA</p>
        <PriceBlock product={product} priceSize={26} originalSize={12} />
        <p className="text-[13px] font-bold text-bosque-deep">Delivery en Lima, se coordina por WhatsApp</p>
        <div className="flex items-center self-start rounded-full border-[3px] border-store-yellow bg-white">
          <button type="button" onClick={onRemove} className="grid size-[42px] place-items-center text-[22px] font-black text-bosque-ink" aria-label={quantity <= 1 ? "Quitar" : "Uno menos"}>
            {quantity <= 1 ? "x" : "-"}
          </button>
          <span className="min-w-6 text-center text-[17px] font-black text-bosque-ink">{quantity}</span>
          <button
            type="button"
            onClick={onAdd}
            disabled={quantity >= product.stock}
            className="grid size-[42px] place-items-center text-[24px] font-black text-bosque-ink disabled:opacity-30"
            aria-label="Uno más"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionChip text="Eliminar" onClick={onDelete} />
          <ActionChip text="Guardar" onClick={onSave} />
        </div>
      </div>
    </div>
  );
}
