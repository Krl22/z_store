import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { RemoteImage } from "@/components/ui";
import * as api from "@/lib/api";
import { formatOrderStatus, formatPaymentStatus, formatSoles, hasValidOffer, orderCode, whatsappUrl } from "@/lib/format";
import type { AdminCustomer, AdminNotification, HomePromo, NotificationPreferences, Order, Product, StoreSettings } from "@/lib/types";
import { useStore } from "@/state/StoreContext";
import { emptyProduct, emptyPromo, ProductEditor, PromoEditor } from "./AdminEditors";
import {
  ADMIN_GOLD,
  ADMIN_GOLD_SOFT,
  ADMIN_OK,
  ADMIN_OK_SOFT,
  ADMIN_RED,
  ADMIN_RED_SOFT,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminConfirm,
  adminDate,
  AdminDetail,
  AdminFilters,
  AdminLoading,
  AdminMessage,
  AdminSearchField,
  AdminSectionHeading,
  AdminStat,
  AdminStepper,
  AdminToggle,
  matches,
} from "./AdminUi";

// Panel admin web: mismas secciones, textos y confirmaciones que AdminPanel.kt de la app.

type Section = "orders" | "products" | "promos" | "customers" | "notifications" | "store";

const SECTIONS: { key: Section; label: string; emoji: string }[] = [
  { key: "orders", label: "Pedidos", emoji: "🧾" },
  { key: "products", label: "Productos", emoji: "📦" },
  { key: "promos", label: "Anuncios", emoji: "📣" },
  { key: "customers", label: "Clientes", emoji: "👥" },
  { key: "notifications", label: "Notificaciones", emoji: "🔔" },
  { key: "store", label: "Tienda", emoji: "🏪" },
];

export default function AdminPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("orders");
  const [orderFilter, setOrderFilter] = useState<string | null>("pending_payment");
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [freshOrders, freshNotifications] = await Promise.all([api.fetchAdminOrders(), api.fetchAdminNotifications(), store.refreshCatalog()]);
    setOrders(freshOrders);
    setNotifications(freshNotifications);
  }, [store]);

  useEffect(() => {
    if (!store.isAdmin) return;
    load().catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el panel."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isAdmin]);

  if (!store.ready) return <AdminLoading />;
  if (!store.isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-store-mint text-store-link">
          <Icon name="admin" size={32} />
        </span>
        <h1 className="text-[24px] font-black text-bosque-ink">Panel solo para administradores</h1>
        <p className="text-[14px] text-bosque-muted">{store.session ? "Tu cuenta no tiene permisos de administrador." : "Inicia sesión con tu cuenta de administrador."}</p>
        <button type="button" onClick={() => navigate("/perfil")} className="h-12 rounded-full bg-store-yellow px-6 font-black text-bosque-ink">
          Ir a Perfil
        </button>
      </div>
    );
  }

  const lowThreshold = store.settings?.low_stock_threshold ?? 3;
  const pendingPayment = (orders ?? []).filter((o) => o.status === "pending_payment").length;
  const lowStock = store.allProducts.filter((p) => p.is_active && p.stock <= lowThreshold).length;
  const unread = notifications.filter((n) => !n.is_read).length;

  async function refresh() {
    setRefreshing(true);
    setReloadKey((k) => k + 1);
    try {
      await load();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bosque-background pb-28 md:pb-12">
      <div className="safe-top sticky top-0 z-20 border-b border-bosque-border bg-white md:top-16">
        <div className="mx-auto max-w-[1320px] md:px-2">
        <div className="flex items-center px-4 pt-2.5">
          <div className="flex-1">
            <p className="text-[11px] font-bold" style={{ color: ADMIN_GOLD }}>
              ZETA DORADA · ADMIN
            </p>
            <h1 className="text-[22px] font-bold text-bosque-ink">Administración</h1>
          </div>
          <button type="button" onClick={refresh} disabled={refreshing} aria-label="Actualizar" className="grid size-10 place-items-center rounded-full bg-bosque-strong text-bosque-deep">
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
          </button>
        </div>
        {pendingPayment > 0 || lowStock > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (pendingPayment > 0) {
                setSection("orders");
                setOrderFilter("pending_payment");
              } else {
                setSection("products");
                setProductFilter("low");
              }
            }}
            className="mx-4 my-2.5 flex w-[calc(100%-2rem)] max-w-[560px] items-center gap-2.5 rounded-[14px] p-3 text-left"
            style={{ background: ADMIN_GOLD_SOFT }}
          >
            <span aria-hidden>🔔</span>
            <span className="flex-1">
              <span className="block text-[14px] font-medium text-bosque-ink">
                {[
                  pendingPayment ? (pendingPayment === 1 ? "1 pedido espera pago" : `${pendingPayment} pedidos esperan pago`) : null,
                  lowStock ? (lowStock === 1 ? "1 producto con stock bajo" : `${lowStock} productos con stock bajo`) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <span className="block text-[12px] text-bosque-muted">Tocar para revisar</span>
            </span>
            <span className="text-bosque-muted">›</span>
          </button>
        ) : null}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1.5">
          {SECTIONS.map((entry) => {
            const active = entry.key === section;
            const label = entry.key === "notifications" && unread ? `${entry.label} (${unread})` : entry.label;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setSection(entry.key)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-[12px] border px-3 text-[14px] font-medium ${active ? "border-bosque-deep bg-bosque-deep text-white" : "border-bosque-border bg-white text-bosque-ink"}`}
              >
                <span aria-hidden className="text-[14px]">
                  {entry.emoji}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-3 p-4 md:px-6">
        {error ? <AdminMessage text={error} isError onRetry={refresh} /> : null}
        {section === "orders" ? <OrdersSection orders={orders} filter={orderFilter} onFilter={setOrderFilter} onChanged={load} /> : null}
        {section === "products" ? <ProductsSection filter={productFilter} onFilter={setProductFilter} lowThreshold={lowThreshold} /> : null}
        {section === "promos" ? <PromosSection /> : null}
        {section === "customers" ? <CustomersSection reloadKey={reloadKey} /> : null}
        {section === "notifications" ? <NotificationsSection notifications={notifications} reloadKey={reloadKey} onMarkedRead={load} /> : null}
        {section === "store" ? <StoreSection reloadKey={reloadKey} /> : null}
      </div>
    </div>
  );
}

// ---------- Pedidos ----------

const ORDER_FILTERS = [
  { value: "pending_payment", label: "Pendientes de pago" },
  { value: "paid", label: "Pagados" },
  { value: "preparing", label: "Preparando" },
  { value: "ready", label: "Listos" },
  { value: "completed", label: "Completados" },
  { value: "cancelled", label: "Cancelados" },
  { value: null, label: "Todos" },
] as const;

function statusColors(status: string) {
  if (status === "pending_payment") return [ADMIN_GOLD, ADMIN_GOLD_SOFT];
  if (status === "cancelled") return [ADMIN_RED, ADMIN_RED_SOFT];
  if (status === "completed") return ["#6C735D", "#FAF7EC"];
  return [ADMIN_OK, ADMIN_OK_SOFT];
}

function OrdersSection({ orders, filter, onFilter, onChanged }: { orders: Order[] | null; filter: string | null; onFilter: (f: string | null) => void; onChanged: () => Promise<void> }) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);
  const list = orders ?? [];
  const visible = list.filter((o) => (filter == null || o.status === filter) && matches(query, orderCode(o.id), o.customer_name, o.customer_phone, o.customer_email));

  async function change(order: Order, status: string) {
    setBusyId(order.id);
    try {
      await api.updateOrderStatus(order.id, status);
      await onChanged();
      store.showToast(`Pedido #${orderCode(order.id)}: ${formatOrderStatus(status).toLowerCase()}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo actualizar el pedido.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminSectionHeading title="Pedidos" description="Confirma pagos y avanza cada pedido hasta la entrega. Abre el detalle para ver productos y dirección." count={orders ? list.length : null} />
      <AdminSearchField value={query} onChange={setQuery} label="Código, cliente o teléfono" />
      <AdminFilters
        options={ORDER_FILTERS.map((f) => ({ value: f.value as string | null, label: f.value == null ? f.label : `${f.label} (${list.filter((o) => o.status === f.value).length})` }))}
        selected={filter}
        onSelect={onFilter}
      />
      {orders == null ? (
        <AdminLoading />
      ) : visible.length === 0 ? (
        <AdminMessage text={query ? "No hay pedidos que coincidan con tu búsqueda." : filter === "pending_payment" ? "No hay pedidos esperando pago." : "No hay pedidos en esta lista."} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {visible.map((order) => <OrderCard key={order.id} order={order} busy={busyId === order.id} onStatus={(s) => (s === "cancelled" ? setPendingCancel(order) : change(order, s))} />)}
        </div>
      )}
      {pendingCancel ? (
        <AdminConfirm
          title={`¿Cancelar el pedido #${orderCode(pendingCancel.id)}?`}
          message={`El stock reservado vuelve a la tienda y el pedido no se puede reabrir.${pendingCancel.payment_status === "paid" ? " Si el cliente ya pagó, devuélvele el dinero por Yape." : ""}`}
          confirmLabel="Cancelar pedido"
          destructive
          onConfirm={() => {
            const order = pendingCancel;
            setPendingCancel(null);
            change(order, "cancelled");
          }}
          onClose={() => setPendingCancel(null)}
        />
      ) : null}
    </>
  );
}

function OrderCard({ order, busy, onStatus }: { order: Order; busy: boolean; onStatus: (status: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [fg, bg] = statusColors(order.status);
  const items = order.order_items.reduce((s, i) => s + i.quantity, 0);
  const snapshot = order.delivery_address_snapshot ?? {};
  const address = [snapshot.line1, snapshot.line2, snapshot.district, snapshot.city].filter(Boolean).join(", ") + (snapshot.reference ? `\nReferencia: ${snapshot.reference}` : "");
  const wa = whatsappUrl(order.customer_phone, `Hola${order.customer_name ? ` ${order.customer_name}` : ""}, te escribimos de Zeta Dorada por tu pedido #${orderCode(order.id)}.`);
  const next = { pending_payment: ["paid", "Pago recibido"], paid: ["preparing", "Marcar preparando"], preparing: ["ready", "Marcar listo"], ready: ["completed", "Marcar entregado"] }[
    order.status as "pending_payment" | "paid" | "preparing" | "ready"
  ];

  return (
    <AdminCard>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-bosque-ink">Pedido #{orderCode(order.id)}</p>
          <p className="text-[12px] text-bosque-muted">
            {adminDate(order.created_at)} · {items === 1 ? "1 producto" : `${items} productos`}
          </p>
        </div>
        <AdminBadge label={formatOrderStatus(order.status)} color={fg} background={bg} />
      </div>
      <p className="text-[14px] font-semibold text-bosque-ink">{order.customer_name || order.customer_email || "Cliente sin nombre"}</p>
      {order.customer_phone ? <p className="text-[14px] text-bosque-ink">{order.customer_phone}</p> : null}
      <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-3">
        <AdminDetail label="Total" value={formatSoles(order.total)} />
        <AdminDetail label="Entrega" value={order.delivery_method === "pickup" ? "Recojo" : "Delivery"} />
        <AdminDetail label="Pago" value={formatPaymentStatus(order.payment_status)} />
      </div>
      <button type="button" onClick={() => setExpanded(!expanded)} className="h-10 text-[14px] font-medium text-bosque-green">
        {expanded ? "Ocultar detalle ▴" : "Ver detalle ▾"}
      </button>
      {expanded ? (
        <div className="flex flex-col gap-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              <RemoteImage url={item.image_url} alt={item.product_name} className="size-11 shrink-0 rounded-[12px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-bosque-ink">{item.product_name}</p>
                <p className="text-[12px] text-bosque-muted">
                  {item.quantity} × {formatSoles(item.unit_price)}
                </p>
              </div>
              <p className="text-[14px] font-semibold text-bosque-ink">{formatSoles(item.quantity * item.unit_price)}</p>
            </div>
          ))}
          <hr className="border-bosque-border" />
          {order.delivery_method !== "pickup" ? <AdminDetail label="Dirección" value={address} /> : null}
          <AdminDetail label="Correo" value={order.customer_email} />
          {!order.user_id ? <AdminDetail label="Cuenta" value="Eliminada" /> : null}
        </div>
      ) : null}
      {wa ? (
        <a href={wa} target="_blank" rel="noopener" className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#9AA389] text-[14px] font-medium text-bosque-green">
          <Icon name="whatsapp" size={18} />
          Escribir por WhatsApp
        </a>
      ) : null}
      {busy ? (
        <AdminLoading />
      ) : next ? (
        <div className="flex gap-2.5">
          <AdminButton variant="danger" onClick={() => onStatus("cancelled")} className="flex-1">
            Cancelar
          </AdminButton>
          <AdminButton onClick={() => onStatus(next[0])} className="flex-[1.4]">
            {next[1]}
          </AdminButton>
        </div>
      ) : null}
    </AdminCard>
  );
}

// ---------- Productos ----------

const PRODUCT_FILTERS = [
  { value: null, label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "hidden", label: "Ocultos" },
  { value: "low", label: "Stock bajo" },
  { value: "offer", label: "En oferta" },
] as const;

function ProductsSection({ filter, onFilter, lowThreshold }: { filter: string | null; onFilter: (f: string | null) => void; lowThreshold: number }) {
  const store = useStore();
  const products = store.allProducts;
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const test = (p: Product, code: string | null) =>
    code === "active" ? p.is_active : code === "hidden" ? !p.is_active : code === "low" ? p.is_active && p.stock <= lowThreshold : code === "offer" ? hasValidOffer(p) : true;
  const visible = products.filter((p) => test(p, filter) && matches(query, p.name, p.category, p.format, p.id));

  return (
    <>
      <AdminSectionHeading title="Productos" description="Edita precios, stock e imágenes. Los productos ocultos no aparecen en la tienda." count={products.length} />
      <AdminButton onClick={() => setEditing(emptyProduct(products.length + 1))} className="h-12 w-full">
        + Nuevo producto
      </AdminButton>
      <AdminSearchField value={query} onChange={setQuery} label="Nombre o categoría" />
      <AdminFilters
        options={PRODUCT_FILTERS.map((f) => ({ value: f.value as string | null, label: f.value == null ? f.label : `${f.label} (${products.filter((p) => test(p, f.value)).length})` }))}
        selected={filter}
        onSelect={onFilter}
      />
      {visible.length === 0 ? (
        <AdminMessage text={query ? "No hay productos que coincidan con tu búsqueda." : "No hay productos en esta lista."} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {visible.map((product) => (
          <ProductCard key={product.id} product={product} lowThreshold={lowThreshold} onEdit={() => setEditing(product)} onDelete={() => setPendingDelete(product)} />
        ))}
        </div>
      )}
      {editing ? (
        <ProductEditor
          initial={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={async (product) => {
            await api.saveProduct(product);
            await store.refreshCatalog();
            store.showToast("Producto guardado");
          }}
          onDelete={(product) => {
            setEditing(null);
            setPendingDelete(product);
          }}
        />
      ) : null}
      {pendingDelete ? (
        <AdminConfirm
          title={`¿Eliminar ${pendingDelete.name}?`}
          message="Desaparece de la tienda y de los carritos. Los pedidos anteriores conservan el nombre y el precio. Si solo quieres sacarlo un tiempo, edítalo y desactívalo."
          confirmLabel="Eliminar"
          destructive
          onConfirm={async () => {
            const product = pendingDelete;
            setPendingDelete(null);
            try {
              await api.deleteProduct(product.id);
              await store.refreshCatalog();
              store.showToast("Producto eliminado");
            } catch (e) {
              alert(e instanceof Error ? e.message : "No se pudo eliminar el producto.");
            }
          }}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  );
}

function ProductCard({ product, lowThreshold, onEdit, onDelete }: { product: Product; lowThreshold: number; onEdit: () => void; onDelete: () => void }) {
  const store = useStore();
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);
  useEffect(() => setStock(product.stock), [product.stock]);
  const offer = hasValidOffer(product);

  return (
    <AdminCard>
      <div className="flex gap-3">
        <RemoteImage url={product.image_urls[0] ?? ""} alt={product.name} className="size-16 shrink-0 rounded-[14px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <p className="line-clamp-2 text-[16px] font-semibold text-bosque-ink">{product.name}</p>
          <p className="text-[12px] text-bosque-muted">{[product.category, product.format].filter(Boolean).join(" · ")}</p>
          <p className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-bosque-ink">{formatSoles(offer ? product.offer_price! : product.price)}</span>
            {offer ? <span className="text-[12px] text-bosque-muted line-through">{formatSoles(product.price)}</span> : null}
          </p>
        </div>
      </div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {!product.is_active ? <AdminBadge label="Oculto" color="#6C735D" background="#FAF7EC" /> : null}
        {product.stock === 0 ? (
          <AdminBadge label="Agotado" color={ADMIN_RED} background={ADMIN_RED_SOFT} />
        ) : product.stock <= lowThreshold ? (
          <AdminBadge label="Stock bajo" color={ADMIN_GOLD} background={ADMIN_GOLD_SOFT} />
        ) : null}
        {offer ? <AdminBadge label="Oferta" color={ADMIN_OK} background={ADMIN_OK_SOFT} /> : null}
        {product.is_featured_offer ? <AdminBadge label="Destacado" /> : null}
      </div>
      <hr className="border-bosque-border" />
      <div className="flex items-center">
        <span className="flex-1 text-[14px] font-medium text-bosque-ink">Stock</span>
        {saving ? (
          <span className="size-5 animate-spin rounded-full border-2 border-bosque-green border-t-transparent" />
        ) : (
          <>
            <AdminStepper value={stock} onChange={setStock} />
            {stock !== product.stock ? (
              <AdminButton
                variant="text"
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.updateProductStock(product.id, stock);
                    await store.refreshCatalog();
                    store.showToast(`${product.name}: stock ${stock}`);
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "No se pudo guardar el stock.");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Guardar
              </AdminButton>
            ) : null}
          </>
        )}
      </div>
      <div className="flex gap-2.5">
        <AdminButton variant="outline" onClick={onEdit} className="flex-1">
          ✎ Editar
        </AdminButton>
        <AdminButton variant="danger" onClick={onDelete} className="flex-1">
          Eliminar
        </AdminButton>
      </div>
    </AdminCard>
  );
}

// ---------- Anuncios ----------

function PromosSection() {
  const store = useStore();
  const [editing, setEditing] = useState<HomePromo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HomePromo | null>(null);
  const promos = [...store.allPromos].sort((a, b) => a.display_order - b.display_order);

  return (
    <>
      <AdminSectionHeading
        title="Anuncios del inicio"
        description={`Banners del carrusel de la tienda. Cambian cada ${store.settings?.ad_rotation_seconds ?? 4} s; puedes ajustarlo en Tienda.`}
        count={promos.length}
      />
      <AdminButton onClick={() => setEditing(emptyPromo(promos.length + 1))} className="h-12 w-full">
        + Nuevo anuncio
      </AdminButton>
      {promos.length === 0 ? (
        <AdminMessage text="No hay anuncios. La tienda muestra un banner por defecto." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {promos.map((promo) => (
          <AdminCard key={promo.id}>
            <div className="flex gap-3">
              <RemoteImage url={promo.image_url} alt={promo.title} className="size-16 shrink-0 rounded-[14px]" />
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {promo.eyebrow ? (
                  <p className="text-[11px] font-bold uppercase" style={{ color: ADMIN_GOLD }}>
                    {promo.eyebrow}
                  </p>
                ) : null}
                <p className="text-[16px] font-semibold text-bosque-ink">{promo.title}</p>
                {promo.detail ? <p className="line-clamp-2 text-[12px] text-bosque-muted">{promo.detail}</p> : null}
              </div>
            </div>
            <div className="flex gap-1.5">
              {promo.is_active ? <AdminBadge label="Visible" color={ADMIN_OK} background={ADMIN_OK_SOFT} /> : <AdminBadge label="Oculto" color="#6C735D" background="#FAF7EC" />}
              <AdminBadge label={`Posición ${promo.display_order}`} color="#6C735D" background="#FAF7EC" />
            </div>
            <div className="flex gap-2.5">
              <AdminButton variant="outline" onClick={() => setEditing(promo)} className="flex-1">
                ✎ Editar
              </AdminButton>
              <AdminButton variant="danger" onClick={() => setPendingDelete(promo)} className="flex-1">
                Eliminar
              </AdminButton>
            </div>
          </AdminCard>
        ))}
        </div>
      )}
      {editing ? (
        <PromoEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (promo) => {
            await api.savePromo(promo);
            await store.refreshCatalog();
            store.showToast("Anuncio guardado");
          }}
          onDelete={(promo) => {
            setEditing(null);
            setPendingDelete(promo);
          }}
        />
      ) : null}
      {pendingDelete ? (
        <AdminConfirm
          title="¿Eliminar el anuncio?"
          message={`"${pendingDelete.title}" deja de aparecer en el carrusel. Si solo quieres pausarlo, edítalo y ocúltalo.`}
          confirmLabel="Eliminar"
          destructive
          onConfirm={async () => {
            const promo = pendingDelete;
            setPendingDelete(null);
            try {
              await api.deletePromo(promo.id);
              await store.refreshCatalog();
              store.showToast("Anuncio eliminado");
            } catch (e) {
              alert(e instanceof Error ? e.message : "No se pudo eliminar el anuncio.");
            }
          }}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  );
}

// ---------- Clientes ----------

type CustomerAction = "reset_cart" | "reset_account" | "make_admin" | "remove_admin" | "delete";

const CUSTOMER_FILTERS = [
  { value: null, label: "Todos" },
  { value: "orders", label: "Con pedidos" },
  { value: "pending", label: "Pago pendiente" },
  { value: "admin", label: "Admins" },
] as const;

const providerLabel = (p: string) => ({ google: "Google", email: "Correo y contraseña", facebook: "Facebook", phone: "SMS" })[p] ?? p;

function CustomersSection({ reloadKey }: { reloadKey: number }) {
  const store = useStore();
  const navigate = useNavigate();
  const myId = store.session?.user.id;
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localReload, setLocalReload] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ customer: AdminCustomer; action: CustomerAction } | null>(null);

  useEffect(() => {
    setCustomers(null);
    setError(null);
    api
      .fetchCustomers()
      .then(setCustomers)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "No se pudo cargar la lista.");
        setCustomers([]);
      });
  }, [reloadKey, localReload]);

  const test = (c: AdminCustomer, code: string | null) => (code === "orders" ? c.orders_count > 0 : code === "pending" ? c.pending_orders_count > 0 : code === "admin" ? c.role === "admin" : true);
  const list = customers ?? [];
  const visible = list.filter((c) => test(c, filter) && matches(query, c.full_name, c.phone, c.email, c.id));
  const displayName = (c: AdminCustomer) => c.full_name || c.email.split("@")[0] || "esta cuenta";

  async function run(customer: AdminCustomer, action: CustomerAction) {
    setBusyId(customer.id);
    try {
      if (action === "reset_cart") await api.resetCustomer(customer.id, "cart");
      if (action === "reset_account") await api.resetCustomer(customer.id, "account");
      if (action === "make_admin") await api.setCustomerAdmin(customer.id, true);
      if (action === "remove_admin") await api.setCustomerAdmin(customer.id, false);
      if (action === "delete") await api.deleteCustomer(customer.id);
      const name = displayName(customer);
      store.showToast(
        {
          reset_cart: `Carrito de ${name} vaciado`,
          reset_account: `Cuenta de ${name} reiniciada`,
          make_admin: `${name} ahora es administrador`,
          remove_admin: `${name} ya no es administrador`,
          delete: "Cuenta eliminada",
        }[action],
      );
      if (customer.id === myId && action === "delete") {
        await store.signOut();
        navigate("/");
      } else if (customer.id === myId && action === "remove_admin") {
        await store.refreshAccount();
        navigate("/");
      } else setLocalReload((k) => k + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo completar la acción.");
    } finally {
      setBusyId(null);
    }
  }

  const dialog = pending
    ? (() => {
        const name = displayName(pending.customer);
        const isMe = pending.customer.id === myId;
        return {
          reset_cart: ["¿Vaciar carrito y guardados?", `Se quitarán los productos del carrito y de guardados de ${name}. Sus pedidos no cambian.`, "Vaciar"],
          reset_account: [
            "¿Reiniciar cuenta?",
            `Se borrarán las direcciones, el nombre y el teléfono de ${name}, además de su carrito y guardados. Sus pedidos pendientes de pago se cancelan y el stock vuelve a la tienda. El historial de pedidos se conserva.`,
            "Reiniciar",
          ],
          make_admin: ["¿Hacer administrador?", `${name} podrá entrar a este panel: editar productos y anuncios, cambiar pedidos, ver clientes y eliminar cuentas.`, "Hacer admin"],
          remove_admin: ["¿Quitar administrador?", isMe ? "Dejarás de ver este panel. Otro administrador tendrá que devolverte el permiso." : `${name} ya no podrá entrar a este panel.`, "Quitar"],
          delete: [
            isMe ? "¿Eliminar tu propia cuenta?" : "¿Eliminar cuenta?",
            `${isMe ? "Es la cuenta con la que estás usando la tienda: se cerrará tu sesión. " : ""}Se borrarán el inicio de sesión, el perfil, las direcciones, el carrito y los guardados de ${name}. Sus pedidos pendientes de pago se cancelan; los demás pedidos se conservan sin usuario. Si vuelve a entrar con Google, será una cuenta nueva.`,
            "Eliminar",
          ],
        }[pending.action];
      })()
    : null;

  return (
    <>
      <AdminSectionHeading title="Clientes" description="Consulta compras, acceso y contacto. Abre Gestionar cuenta para permisos o para repetir pruebas." count={customers ? list.length : null} />
      <AdminSearchField value={query} onChange={setQuery} label="Nombre, teléfono o correo" />
      {customers && !error ? (
        <AdminFilters
          options={CUSTOMER_FILTERS.map((f) => ({ value: f.value as string | null, label: f.value == null ? f.label : `${f.label} (${list.filter((c) => test(c, f.value)).length})` }))}
          selected={filter}
          onSelect={setFilter}
        />
      ) : null}
      {customers == null ? (
        <AdminLoading />
      ) : error ? (
        <AdminMessage text={error} isError onRetry={() => setLocalReload((k) => k + 1)} />
      ) : visible.length === 0 ? (
        <AdminMessage text={query ? "No hay clientes que coincidan con tu búsqueda." : "No hay clientes en esta lista."} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {visible.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            name={displayName(customer)}
            isMe={customer.id === myId}
            busy={busyId === customer.id}
            onAction={(action) => setPending({ customer, action })}
          />
        ))}
        </div>
      )}
      <p className="text-[12px] text-bosque-muted">Los pedidos se conservan al reiniciar o eliminar una cuenta. Para ver un reinicio, la persona debe volver a abrir la tienda.</p>
      {pending && dialog ? (
        <AdminConfirm
          title={dialog[0]!}
          message={dialog[1]!}
          confirmLabel={dialog[2]!}
          destructive={pending.action !== "make_admin"}
          requireAcknowledgement={pending.action === "delete" ? "Entiendo que esto no se puede deshacer" : undefined}
          onConfirm={() => {
            const { customer, action } = pending;
            setPending(null);
            run(customer, action);
          }}
          onClose={() => setPending(null)}
        />
      ) : null}
    </>
  );
}

function CustomerCard({ customer, name, isMe, busy, onAction }: { customer: AdminCustomer; name: string; isMe: boolean; busy: boolean; onAction: (a: CustomerAction) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const isAdmin = customer.role === "admin";
  const wa = whatsappUrl(customer.phone, `Hola${customer.full_name ? ` ${customer.full_name}` : ""}, te escribimos de Zeta Dorada.`);
  const actions: [CustomerAction, string][] = [
    ["reset_cart", "Vaciar carrito y guardados"],
    ["reset_account", "Reiniciar cuenta"],
    [isAdmin ? "remove_admin" : "make_admin", isAdmin ? "Quitar admin" : "Hacer admin"],
    ["delete", "Eliminar cuenta"],
  ];

  return (
    <AdminCard>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bosque-strong text-[16px] font-bold text-bosque-deep">{name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-bosque-ink">
            {customer.full_name || "Perfil sin nombre"}
            {isMe ? " (tú)" : ""}
          </p>
          {isAdmin ? <AdminBadge label="Administrador" /> : null}
        </div>
      </div>
      {customer.email ? <p className="text-[12px] text-bosque-muted">{customer.email}</p> : null}
      {customer.phone ? <p className="text-[14px] text-bosque-ink">{customer.phone}</p> : null}
      <div className="flex gap-2.5">
        <AdminStat label="Pedidos" value={String(customer.orders_count)} />
        <AdminStat label="Pagado" value={formatSoles(customer.total_paid)} />
        <AdminStat label="En carrito" value={String(customer.cart_units)} />
      </div>
      {customer.pending_orders_count > 0 ? (
        <div>
          <AdminBadge
            label={customer.pending_orders_count === 1 ? "1 pedido pendiente de pago" : `${customer.pending_orders_count} pedidos pendientes de pago`}
            color={ADMIN_GOLD}
            background={ADMIN_GOLD_SOFT}
          />
        </div>
      ) : null}
      {wa ? (
        <a href={wa} target="_blank" rel="noopener" className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#9AA389] text-[14px] font-medium text-bosque-green">
          <Icon name="whatsapp" size={18} />
          Escribir por WhatsApp
        </a>
      ) : null}
      <button type="button" onClick={() => setExpanded(!expanded)} className="h-10 text-[14px] font-medium text-bosque-green">
        {expanded ? "Ocultar acceso y actividad ▴" : "Ver acceso y actividad ▾"}
      </button>
      {expanded ? (
        <div className="flex flex-col gap-2">
          <hr className="border-bosque-border" />
          <AdminDetail label="Inicia sesión con" value={customer.providers.map(providerLabel).join(", ") || "Sin método registrado"} />
          <AdminDetail label="Correo" value={customer.email ? `${customer.email} · ${customer.email_confirmed ? "verificado" : "sin verificar"}` : ""} />
          <AdminDetail label="Cliente desde" value={adminDate(customer.created_at)} />
          <AdminDetail label="Último ingreso" value={adminDate(customer.last_sign_in_at)} />
          <AdminDetail label="Último pedido" value={adminDate(customer.last_order_at) || "Sin pedidos"} />
          <AdminDetail label="Direcciones guardadas" value={String(customer.addresses_count)} />
          <AdminDetail label="Cuenta" value={customer.id} />
        </div>
      ) : null}
      {busy ? (
        <AdminLoading />
      ) : (
        <div className="relative">
          <AdminButton variant="outline" onClick={() => setMenu(!menu)} className="w-full">
            ⚙ Gestionar cuenta
          </AdminButton>
          {menu ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} role="presentation" />
              <div className="absolute bottom-12 left-0 z-20 w-60 rounded-[12px] bg-white py-2 shadow-xl" role="menu">
                {actions.map(([action, label]) => (
                  <div key={action}>
                    {action === "delete" ? <hr className="my-1 border-bosque-border" /> : null}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenu(false);
                        onAction(action);
                      }}
                      className="block w-full px-4 py-3 text-left text-[14px]"
                      style={{ color: action === "delete" ? ADMIN_RED : "#23301F" }}
                    >
                      {label}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </AdminCard>
  );
}

// ---------- Notificaciones ----------

function NotificationsSection({ notifications, reloadKey, onMarkedRead }: { notifications: AdminNotification[]; reloadKey: number; onMarkedRead: () => Promise<void> }) {
  const store = useStore();
  const userId = store.session!.user.id;
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const unread = notifications.filter((n) => !n.is_read);

  useEffect(() => {
    setError(null);
    api
      .fetchNotificationPreferences(userId)
      .then(setPrefs)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar tus preferencias."));
  }, [reloadKey, userId]);

  async function save(next: NotificationPreferences) {
    const previous = prefs;
    setPrefs(next);
    setSaving(true);
    try {
      await api.saveNotificationPreferences(userId, next);
    } catch (e) {
      setPrefs(previous);
      alert(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminSectionHeading title="Notificaciones" description="Elige qué avisos recibes. Se aplican a todos los dispositivos con tu cuenta, incluso con la app cerrada." />
      {error ? (
        <AdminMessage text={error} isError />
      ) : !prefs ? (
        <AdminLoading />
      ) : (
        <AdminCard className="gap-3">
          <AdminToggle title="Recibir avisos" description="Pausa o reanuda todos los avisos del panel." checked={prefs.enabled} enabled={!saving} onChange={(v) => save({ ...prefs, enabled: v })} />
          <hr className="border-bosque-border" />
          <AdminToggle title="Pedidos nuevos" description="Cuando un cliente confirma un pedido." checked={prefs.new_orders} enabled={prefs.enabled && !saving} onChange={(v) => save({ ...prefs, new_orders: v })} />
          <AdminToggle title="Clientes nuevos" description="Cuando alguien crea su cuenta en Zeta Dorada." checked={prefs.new_customers} enabled={prefs.enabled && !saving} onChange={(v) => save({ ...prefs, new_customers: v })} />
          <AdminToggle title="Stock bajo" description="Cuando un producto activo llega al mínimo que definas en Tienda." checked={prefs.low_stock} enabled={prefs.enabled && !saving} onChange={(v) => save({ ...prefs, low_stock: v })} />
        </AdminCard>
      )}
      <p className="text-[12px] text-bosque-muted">Los avisos push llegan a la app de Android. En la web los ves en esta lista.</p>
      <AdminSectionHeading title="Actividad reciente" description="Los últimos avisos de tu cuenta." count={notifications.length} />
      {unread.length ? (
        <AdminButton
          variant="outline"
          disabled={marking}
          onClick={async () => {
            setMarking(true);
            try {
              await api.markNotificationsRead(unread.map((n) => n.id));
              await onMarkedRead();
            } catch (e) {
              alert(e instanceof Error ? e.message : "No se pudo actualizar.");
            } finally {
              setMarking(false);
            }
          }}
          className="w-full"
        >
          {marking ? "Marcando…" : `Marcar ${unread.length} como leídos`}
        </AdminButton>
      ) : null}
      {notifications.length === 0 ? (
        <AdminMessage text="Todavía no hay avisos." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {notifications.map((n) => (
          <AdminCard key={n.id}>
            <div className="flex gap-3">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full ${n.is_read ? "bg-bosque-soft" : "bg-bosque-strong"}`} aria-hidden>
                {n.kind === "customer" ? "👤" : n.kind === "stock" ? "📦" : "🧾"}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[14px] font-semibold text-bosque-ink">{n.title}</p>
                  {!n.is_read ? <span className="size-2 rounded-full" style={{ background: ADMIN_GOLD }} /> : null}
                </div>
                <p className="text-[12px] text-bosque-ink">{n.body}</p>
                <p className="text-[11px] text-bosque-muted">{adminDate(n.created_at)}</p>
              </div>
            </div>
          </AdminCard>
        ))}
        </div>
      )}
    </>
  );
}

// ---------- Tienda ----------

function StoreSection({ reloadKey }: { reloadKey: number }) {
  const store = useStore();
  const [loaded, setLoaded] = useState<StoreSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [rotation, setRotation] = useState(4);
  const [lowStock, setLowStock] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError(null);
    api
      .fetchStoreSettings()
      .then((settings) => {
        if (!settings) throw new Error("La tienda no tiene ajustes guardados.");
        setLoaded(settings);
        setWhatsapp(settings.whatsapp_number.replace(/^51/, ""));
        setRotation(settings.ad_rotation_seconds);
        setLowStock(settings.low_stock_threshold);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los ajustes."));
  }, [reloadKey]);

  const digits = whatsapp.replace(/\D/g, "");
  const valid = digits.length === 9 && digits.startsWith("9");
  const current: StoreSettings = { whatsapp_number: `51${digits}`, ad_rotation_seconds: rotation, low_stock_threshold: lowStock };
  const changed = loaded != null && JSON.stringify(current) !== JSON.stringify({ whatsapp_number: loaded.whatsapp_number, ad_rotation_seconds: loaded.ad_rotation_seconds, low_stock_threshold: loaded.low_stock_threshold });

  return (
    <>
      <AdminSectionHeading title="Tienda" description="Ajustes compartidos por la app y la web. Los cambios se ven al volver a abrir la tienda." />
      {error ? (
        <AdminMessage text={error} isError />
      ) : !loaded ? (
        <AdminLoading />
      ) : (
        <>
          <AdminCard>
            <p className="text-[16px] font-semibold text-bosque-ink">WhatsApp de pedidos</p>
            <p className="text-[12px] text-bosque-muted">A este número llegan los pedidos y las consultas de pago.</p>
            <label className={`flex h-14 items-center gap-1 rounded-[14px] border bg-white px-3 ${whatsapp && !valid ? "border-[#B42318]" : "border-bosque-border"}`}>
              <span className="text-bosque-muted">+51</span>
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="tel" aria-label="Celular" className="min-w-0 flex-1 bg-transparent text-[16px] text-bosque-ink outline-none" />
            </label>
            {whatsapp && !valid ? <p className="text-[12px] text-[#B42318]">Debe ser un celular de 9 dígitos que empiece con 9.</p> : null}
          </AdminCard>
          <AdminCard>
            <p className="text-[16px] font-semibold text-bosque-ink">Carrusel de anuncios</p>
            <div className="flex items-center">
              <p className="flex-1 text-[12px] text-bosque-muted">Cada banner se muestra {rotation} segundos.</p>
              <AdminStepper value={rotation} onChange={setRotation} min={2} max={60} />
            </div>
          </AdminCard>
          <AdminCard>
            <p className="text-[16px] font-semibold text-bosque-ink">Aviso de stock bajo</p>
            <div className="flex items-center">
              <p className="flex-1 text-[12px] text-bosque-muted">{lowStock === 0 ? "Solo avisa cuando un producto se agota." : `Avisa cuando quedan ${lowStock} unidades o menos.`}</p>
              <AdminStepper value={lowStock} onChange={setLowStock} min={0} max={1000} />
            </div>
          </AdminCard>
          <AdminButton
            disabled={!changed || !valid || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await api.updateStoreSettings(current);
                setLoaded(current);
                store.setSettings(current);
                store.showToast("Ajustes guardados");
              } catch (e) {
                alert(e instanceof Error ? e.message : "No se pudo guardar.");
              } finally {
                setSaving(false);
              }
            }}
            className="h-12 w-full"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </AdminButton>
        </>
      )}
    </>
  );
}
