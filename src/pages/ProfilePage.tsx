import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { DealTile } from "@/components/ProductCards";
import { AccountHeader, AccountTabRow, type HeaderOption } from "@/components/StoreHeader";
import { AccountLine, ActionChip, EmptyStateCard, Modal, RemoteImage, SectionTitle, SoftButton, StatusBadge, StatusPill, YellowButton } from "@/components/ui";
import * as api from "@/lib/api";
import { formatDate, formatOrderStatus, formatPaymentStatus, formatPeruMobile, formatSoles, initials, orderCode, peruMobileDigits } from "@/lib/format";
import { peruRegions } from "@/lib/peruLocations";
import type { Address, Order } from "@/lib/types";
import { useStore } from "@/state/StoreContext";

// ProfileScreen(): Cuenta (datos, teléfono, direcciones, sesión), Pedidos y Mi Lista.

export function ProfilePage() {
  const store = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "cuenta";
  const signedIn = Boolean(store.session);
  const email = store.session?.user.email ?? "";

  const options: HeaderOption[] = [
    { key: "cuenta", text: "Cuenta" },
    { key: "pedidos", text: "Pedidos" },
    store.isAdmin ? { key: "admin", text: "Admin", leading: "admin" } : { key: "listas", text: "Mi Lista" },
  ];

  return (
    <div className={`flex flex-col pb-28 md:pb-12 ${signedIn ? "gap-3.5" : "gap-2.5"}`}>
      <AccountHeader signedIn={signedIn} />
      <main className={`mx-auto flex w-full max-w-[1320px] flex-col md:px-6 md:pt-2 ${signedIn ? "gap-3.5" : "gap-2.5"}`}>
      {signedIn ? (
        <div className="px-3.5 md:px-0">
          <AccountTabRow options={options} selectedKey={tab} onSelected={(key) => (key === "admin" ? navigate("/admin") : setParams({ tab: key }, { replace: true }))} />
        </div>
      ) : null}
      {store.message ? (
        <div className="px-3.5 md:px-0">
          <StatusPill message={store.message} onDismiss={() => store.setMessage(null)} />
        </div>
      ) : null}

      {!signedIn ? (
        <div className="flex flex-col gap-2.5 px-3.5 md:mx-auto md:w-full md:max-w-[520px] md:px-0 md:pt-6">
          <div className="flex items-center gap-3 rounded-[18px] border border-bosque-border/70 bg-white p-4">
            <span className="grid size-[52px] place-items-center rounded-full bg-store-header-bottom text-store-link">
              <Icon name="user" size={31} />
            </span>
            <div>
              <p className="text-[22px] font-black text-bosque-ink">Hola, invitado</p>
              <p className="text-[13px] font-bold leading-[18px] text-bosque-muted">Entra para guardar tus pedidos, direcciones y preferencias.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-[18px] border border-bosque-border/80 bg-white p-4">
            <h2 className="text-[22px] font-black text-bosque-ink">Entrar a mi cuenta</h2>
            <p className="text-[13px] leading-[18px] text-bosque-muted">Continúa con Google para guardar tus pedidos y preferencias.</p>
            <button
              type="button"
              onClick={store.signInWithGoogle}
              className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[16px] bg-bosque-deep font-black text-white"
            >
              <span className="text-[18px]">G</span>
              Continuar con Google
            </button>
            <p className="text-[11px] leading-[15px] text-bosque-muted">Inicia sesión con Google para guardar tu carrito y tus pedidos.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 md:px-0">
          <span className="grid size-[54px] place-items-center rounded-full border border-bosque-border/65 bg-store-mint text-store-link">
            <Icon name="user" size={30} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[22px] font-black text-bosque-ink">Hola, {store.profile?.full_name?.trim() || email.split("@")[0] || "cliente"}</p>
            <p className="truncate text-[13px] font-bold text-bosque-muted">{store.isAdmin ? "Administrador Zeta Dorada" : "Cliente Zeta Dorada"}</p>
          </div>
          <span className="rounded-full bg-bosque-strong px-2.5 py-[7px] text-[11px] font-black text-bosque-deep">{store.isAdmin ? "ADMIN" : "CLIENTE"}</span>
        </div>
      )}

      {signedIn && tab === "cuenta" ? (
        <div className="flex flex-col gap-3.5 px-3.5 md:px-0 lg:grid lg:grid-cols-2 lg:items-start">
          <CustomerDetailsCard email={email} />
          <div className="lg:row-span-2">
            <AddressBook />
          </div>
          <div className="flex flex-col gap-2.5 rounded-[18px] border border-bosque-border/75 bg-white p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full border border-bosque-border bg-bosque-soft text-bosque-muted">
                <Icon name="user" size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-black text-bosque-ink">Sesión activa</p>
                <p className="truncate text-[12px] text-bosque-muted">{email}</p>
              </div>
            </div>
            <SoftButton onClick={store.signOut} className="h-12 w-full rounded-[14px]">
              Cerrar sesión
            </SoftButton>
          </div>
        </div>
      ) : null}

      {signedIn && tab === "pedidos" ? <OrdersSection orders={store.orders} /> : null}

      {signedIn && tab === "listas" ? (
        <div className="flex flex-col gap-2.5 px-3.5 md:px-0">
          <SectionTitle title="Tus listas" detail={`${store.saved.size} guardados`} />
          {store.saved.size === 0 ? (
            <p className="text-[13px] text-bosque-muted">Los productos que guardes para después aparecerán aquí.</p>
          ) : (
            <div className="no-scrollbar flex gap-3 overflow-x-auto">
              {store.products
                .filter((p) => store.saved.has(p.id))
                .slice(0, 8)
                .map((product) => (
                  <DealTile key={product.id} product={product} onClick={() => navigate(`/producto/${product.id}`)} />
                ))}
            </div>
          )}
        </div>
      ) : null}
      </main>
    </div>
  );
}

/** ProfileCustomerDetailsCard() */
function CustomerDetailsCard({ email }: { email: string }) {
  const store = useStore();
  const [editingPhone, setEditingPhone] = useState(false);
  const name = store.profile?.full_name?.trim() || (email.split("@")[0] ?? "").replace(/^./, (c) => c.toUpperCase()) || "Cliente Zeta";
  const savedPhone = store.profile?.phone?.trim() || store.defaultAddress?.phone?.trim() || "";
  const addressLine = store.defaultAddress ? `${store.defaultAddress.line1}, ${store.defaultAddress.district}` : "Agrega una dirección principal";

  return (
    <div className="flex flex-col gap-3.5 rounded-[18px] border border-bosque-border/80 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-[50px] place-items-center rounded-full border border-bosque-border/70 bg-store-mint text-[16px] font-black text-store-link">{initials(name)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[20px] font-black text-bosque-ink">Datos de cliente</p>
          <p className="text-[12px] font-bold text-bosque-muted">Información para pedidos y entrega</p>
        </div>
        <span className="rounded-full bg-bosque-strong px-[9px] py-1.5 text-[11px] font-black text-bosque-deep">Activo</span>
      </div>
      <InfoRow label="Nombre" value={name} />
      <InfoRow label="Email" value={email} />
      <InfoRow label="Teléfono" value={savedPhone || "Pendiente"} />
      <button
        type="button"
        onClick={() => setEditingPhone(true)}
        className={`h-12 w-full rounded-[14px] font-black text-bosque-ink ${savedPhone ? "bg-bosque-strong" : "bg-store-yellow"}`}
      >
        {savedPhone ? "Editar teléfono" : "Agregar teléfono"}
      </button>
      <InfoRow label="Dirección principal" value={addressLine} />
      <p className="text-[12px] leading-4 text-bosque-muted">Usamos estos datos para tu pedido y para coordinar la entrega por WhatsApp.</p>
      {editingPhone ? <PhoneEditor initial={savedPhone} onClose={() => setEditingPhone(false)} /> : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[3px] rounded-[14px] border border-bosque-border/55 bg-bosque-soft px-3 py-2.5">
      <span className="text-[11px] font-bold text-bosque-muted">{label}</span>
      <span className="line-clamp-2 text-[14px] font-black text-bosque-ink">{value}</span>
    </div>
  );
}

/** PhoneEditorDialog(): celular peruano de 9 dígitos con prefijo +51. */
function PhoneEditor({ initial, onClose }: { initial: string; onClose: () => void }) {
  const store = useStore();
  const [digits, setDigits] = useState(peruMobileDigits(initial));
  const [saving, setSaving] = useState(false);
  const canSave = digits.length === 9 && digits.startsWith("9");
  const status = !digits ? "Escribe los 9 dígitos." : !digits.startsWith("9") ? "Debe empezar con 9." : digits.length < 9 ? `Faltan ${9 - digits.length} dígitos.` : "Teléfono listo.";

  return (
    <Modal onClose={onClose} className="flex flex-col gap-3.5 p-4">
      <h2 className="text-[22px] font-black text-bosque-ink">Teléfono de contacto</h2>
      <p className="text-[13px] text-bosque-muted">Lo usamos para coordinar tu pedido por WhatsApp.</p>
      <label className="flex h-14 items-center gap-2 rounded-[16px] border border-bosque-border bg-white px-3">
        <span className="flex items-center gap-1.5 font-black text-bosque-ink">
          <span className="inline-flex h-4 w-6 overflow-hidden rounded-sm border border-bosque-border">
            <span className="w-1/3 bg-[#D91023]" />
            <span className="w-1/3 bg-white" />
            <span className="w-1/3 bg-[#D91023]" />
          </span>
          +51
        </span>
        <input
          value={formatPeruMobile(digits)}
          onChange={(event) => setDigits(event.target.value.replace(/\D/g, "").slice(0, 9))}
          inputMode="tel"
          autoFocus
          placeholder="9XX XXX XXX"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-bold text-bosque-ink outline-none"
        />
      </label>
      <p className={`text-[12px] font-bold ${canSave ? "text-store-link" : "text-bosque-muted"}`}>{status}</p>
      <div className="flex gap-2.5">
        <SoftButton onClick={onClose} className="h-12 flex-1 rounded-[16px]">
          Cancelar
        </SoftButton>
        <YellowButton
          disabled={!canSave || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await store.savePhone(`+51 ${formatPeruMobile(digits)}`);
              onClose();
            } catch (error) {
              store.setMessage(error instanceof Error ? error.message : "No pude guardar el teléfono.");
            } finally {
              setSaving(false);
            }
          }}
          className="h-12 flex-1 !rounded-[16px]"
        >
          Guardar
        </YellowButton>
      </div>
    </Modal>
  );
}

/** AddressBookSection() */
function AddressBook() {
  const store = useStore();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);
  const main = store.defaultAddress;
  const others = store.addresses.filter((a) => a.id !== main?.id);

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-bosque-border bg-white p-4">
      <SectionTitle title="Direcciones" detail={store.addresses.length ? `${store.addresses.length} guardadas` : "sin guardar"} />
      {!main ? (
        <EmptyStateCard
          title="Agrega una dirección de entrega"
          detail="Así tu pedido llega con tus datos de contacto y de entrega."
          action="Agregar dirección"
          onAction={() => setEditing("new")}
        />
      ) : (
        <>
          <div className="flex flex-col gap-[9px] rounded-[18px] border border-bosque-border bg-bosque-soft p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-[38px] place-items-center rounded-full bg-store-mint text-store-link">
                <Icon name="pin" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-black text-bosque-ink">{main.label} principal</p>
                <p className="truncate text-[12px] text-bosque-muted">{main.recipient_name || "Cliente Zeta"}</p>
              </div>
              <StatusBadge text="Delivery" active />
            </div>
            <p className="line-clamp-2 text-[14px] font-bold text-bosque-ink">{main.line1}</p>
            <p className="text-[12px] text-bosque-muted">{[main.district, main.city].filter(Boolean).join(", ")}</p>
            {main.reference ? <p className="line-clamp-2 text-[12px] text-bosque-muted">Ref: {main.reference}</p> : null}
            <div className="flex gap-2.5">
              <ActionChip text="Editar" onClick={() => setEditing(main)} />
              <ActionChip text="Eliminar" onClick={() => setPendingDelete(main)} />
            </div>
          </div>
          {others.length ? (
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
              {others.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setEditing(address)}
                  className="flex w-[188px] shrink-0 flex-col gap-1.5 rounded-[18px] border border-bosque-border bg-bosque-soft p-3 text-left"
                >
                  <span className="truncate font-black text-bosque-ink">{address.label}</span>
                  <span className="line-clamp-2 text-[12px] text-bosque-muted">{address.line1}</span>
                  <span className="text-[12px] font-black text-store-link">{address.district}</span>
                </button>
              ))}
            </div>
          ) : null}
          <YellowButton onClick={() => setEditing("new")} className="h-12 w-full">
            Agregar otra dirección
          </YellowButton>
        </>
      )}
      {editing ? <AddressEditor address={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      {pendingDelete ? (
        <Modal onClose={() => setPendingDelete(null)} className="flex flex-col gap-3 p-4">
          <h2 className="text-[20px] font-black text-bosque-ink">¿Eliminar esta dirección?</h2>
          <p className="text-[13px] text-bosque-muted">
            {pendingDelete.label}: {pendingDelete.line1}, {pendingDelete.district}. Tus pedidos anteriores conservan la dirección con la que se enviaron.
          </p>
          <div className="flex gap-2.5">
            <SoftButton onClick={() => setPendingDelete(null)} className="h-12 flex-1 rounded-[16px]">
              Volver
            </SoftButton>
            <button
              type="button"
              onClick={async () => {
                const address = pendingDelete;
                setPendingDelete(null);
                await store.deleteAddress(address).catch((error) => store.setMessage(error instanceof Error ? error.message : "No pude eliminar la dirección."));
              }}
              className="h-12 flex-1 rounded-[16px] bg-bosque-warmth font-black text-white"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

const LABEL_OPTIONS = ["Casa", "Trabajo", "Familia", "Otro"];

function inferRegion(address: Address | null) {
  const lima = peruRegions.find((r) => r.name === "Lima") ?? peruRegions[0]!;
  if (!address) return lima;
  return peruRegions.find((r) => address.city.includes(r.name) || r.provinces.some((p) => address.city.includes(p.name))) ?? lima;
}

/** AddressEditorDialog() con el selector de departamento, provincia y distrito. */
function AddressEditor({ address, onClose }: { address: Address | null; onClose: () => void }) {
  const store = useStore();
  const initialRegion = inferRegion(address);
  const initialProvince = initialRegion.provinces.find((p) => address?.city.includes(p.name)) ?? initialRegion.provinces[0]!;
  const [label, setLabel] = useState(address?.label ?? "Casa");
  const [recipient, setRecipient] = useState(address?.recipient_name || store.profile?.full_name?.trim() || "");
  const [regionName, setRegionName] = useState(initialRegion.name);
  const [provinceName, setProvinceName] = useState(initialProvince.name);
  const [district, setDistrict] = useState(address?.district ?? initialProvince.districts[0] ?? "");
  const [line1, setLine1] = useState(address?.line1 ?? "");
  const [line2, setLine2] = useState(address?.line2 ?? "");
  const [reference, setReference] = useState(address?.reference ?? "");
  const [isDefault, setIsDefault] = useState(address?.is_default ?? true);
  const [saving, setSaving] = useState(false);

  const region = peruRegions.find((r) => r.name === regionName) ?? peruRegions[0]!;
  const province = region.provinces.find((p) => p.name === provinceName) ?? region.provinces[0]!;
  useEffect(() => {
    if (!province.districts.includes(district)) setDistrict(province.districts[0] ?? "");
  }, [province, district]);
  const canSave = line1.trim() && recipient.trim() && district;

  return (
    <Modal onClose={onClose} className="flex flex-col gap-3.5 border border-bosque-border/80 !bg-white p-3.5">
      <div className="flex items-center gap-3 rounded-[22px] bg-gradient-to-br from-store-mint to-bosque-strong p-3.5">
        <span className="grid size-12 place-items-center rounded-full border border-white bg-white/90 text-store-link">
          <Icon name="pin" size={26} />
        </span>
        <div>
          <h2 className="text-[22px] font-black text-bosque-ink">{address ? "Editar dirección" : "Nueva dirección"}</h2>
          <p className="text-[12px] font-bold text-bosque-muted">Datos de entrega en Perú.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-black text-bosque-ink">Etiqueta</span>
        <div className="flex flex-wrap gap-2">
          {LABEL_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLabel(option)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-black ${label === option ? "border-bosque-deep bg-bosque-deep text-white" : "border-bosque-border bg-white text-bosque-ink"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <Field label="Nombre de quien recibe" value={recipient} onChange={setRecipient} />
      <Select label="Departamento" value={regionName} options={peruRegions.map((r) => r.name)} onChange={(value) => {
        setRegionName(value);
        const next = peruRegions.find((r) => r.name === value)!;
        setProvinceName(next.provinces[0]!.name);
        setDistrict(next.provinces[0]!.districts[0] ?? "");
      }} />
      <Select label="Provincia" value={provinceName} options={region.provinces.map((p) => p.name)} onChange={(value) => {
        setProvinceName(value);
        setDistrict(region.provinces.find((p) => p.name === value)!.districts[0] ?? "");
      }} />
      <Select label="Distrito" value={district} options={province.districts} onChange={setDistrict} />
      <Field label="Calle, avenida, jirón o mz/lote" value={line1} onChange={setLine1} />
      <Field label="Dpto, piso, interior o urbanización" value={line2} onChange={setLine2} />
      <Field label="Referencia para el repartidor" value={reference} onChange={setReference} />

      <div className="flex flex-col gap-[7px] rounded-[18px] border border-bosque-border/65 bg-store-header-bottom p-3">
        <p className="text-[15px] font-black text-bosque-ink">{label || "Dirección"}</p>
        <p className="truncate text-[12px] font-bold text-bosque-muted">{recipient || "Nombre pendiente"}</p>
        <p className="line-clamp-2 text-[13px] font-black text-bosque-ink">{[line1, line2].filter(Boolean).join(", ") || "Completa la dirección exacta"}</p>
        <p className="text-[12px] font-black text-store-link">
          {district}, {provinceName}, {regionName}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsDefault(!isDefault)}
        className={`h-12 w-full rounded-full border font-black text-bosque-ink ${isDefault ? "border-store-yellow bg-store-yellow" : "border-bosque-border bg-white"}`}
      >
        {isDefault ? "Dirección principal" : "Marcar como principal"}
      </button>
      <div className="flex gap-2.5">
        <button type="button" onClick={onClose} className="h-[50px] flex-1 rounded-[16px] border border-bosque-border bg-white font-black text-bosque-ink">
          Cancelar
        </button>
        <YellowButton
          disabled={!canSave || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await store.saveAddress({
                id: address?.id,
                label: label || "Casa",
                recipient_name: recipient.trim(),
                phone: address?.phone ?? "",
                line1: line1.trim(),
                line2: line2.trim(),
                district,
                city: `${provinceName}, ${regionName}`,
                country: "PE",
                reference: reference.trim(),
                is_default: isDefault,
              });
              onClose();
            } catch (error) {
              store.setMessage(error instanceof Error ? error.message : "No pude guardar la dirección.");
            } finally {
              setSaving(false);
            }
          }}
          className="h-[50px] flex-1 !rounded-[16px]"
        >
          Guardar
        </YellowButton>
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-bold text-bosque-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[14px] border border-bosque-border bg-bosque-soft px-3 text-[15px] font-bold text-bosque-ink outline-none focus:border-store-link"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-bold text-bosque-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[14px] border border-bosque-border bg-bosque-soft px-3 text-[15px] font-bold text-bosque-ink outline-none focus:border-store-link"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/** ProfileOrdersSection() + OrderDetailDialog() */
function OrdersSection({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<Order | null>(null);
  const [whatsappBusy, setWhatsappBusy] = useState(false);
  const store = useStore();

  return (
    <div className="flex flex-col gap-2.5 px-3.5 md:px-0">
      <SectionTitle title="Tus pedidos" detail={`${orders.length} registrados`} />
      {orders.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[18px] border border-bosque-border/75 bg-gradient-to-br from-white to-[#F6FAEE] p-4">
          <span className="grid size-[46px] place-items-center rounded-full bg-store-mint text-store-link">
            <Icon name="search" size={25} />
          </span>
          <div className="flex flex-col gap-[5px]">
            <p className="text-[18px] font-black text-bosque-ink">Aún no tienes pedidos</p>
            <p className="text-[13px] leading-[18px] text-bosque-muted">Cuando completes una compra, verás aquí tu historial.</p>
            <p className="text-[12px] font-black text-store-link">Explora el catálogo y arma tu primer pedido.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <StatusBadge text={`${orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length} en curso`} active />
            <StatusBadge text={`${orders.filter((o) => o.status === "completed").length} completados`} active={false} />
          </div>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
            {orders.map((order) => {
              const first = order.order_items[0];
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelected(order)}
                  className="flex w-[246px] shrink-0 flex-col gap-[9px] rounded-[18px] border border-bosque-border bg-white p-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <RemoteImage url={first?.image_url ?? ""} alt={first?.product_name ?? ""} className="size-16 shrink-0 rounded-[14px]" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-bosque-ink">Pedido {orderCode(order.id)}</p>
                      <p className="text-[12px] font-black text-bosque-warmth">
                        {order.order_items.reduce((s, i) => s + i.quantity, 0)} items - {formatSoles(order.total)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <StatusBadge text={formatOrderStatus(order.status)} active={order.status !== "cancelled"} />
                  </div>
                  <p className="truncate text-[12px] text-bosque-muted">{first?.product_name ?? "Compra Zeta Dorada"}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {selected ? (
        <Modal onClose={() => setSelected(null)} className="flex flex-col gap-3 p-4">
          <h2 className="text-[24px] font-black text-bosque-ink">Pedido {orderCode(selected.id)}</h2>
          <p className="text-[14px] font-black text-bosque-deep">{formatOrderStatus(selected.status)}</p>
          <AccountLine label="Fecha" value={formatDate(selected.created_at)} />
          <AccountLine label="Pago" value={formatPaymentStatus(selected.payment_status)} />
          <AccountLine label="Entrega" value={selected.delivery_method === "pickup" ? "Recojo en tienda" : "Delivery"} />
          <AccountLine label="Items" value={String(selected.order_items.reduce((s, i) => s + i.quantity, 0))} />
          <AccountLine label="Total" value={formatSoles(selected.total)} />
          <p className="text-[17px] font-black text-bosque-ink">Productos</p>
          {selected.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              <RemoteImage url={item.image_url} alt={item.product_name} className="size-[62px] shrink-0 rounded-[14px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-bosque-ink">{item.product_name}</p>
                <p className="text-[12px] text-bosque-muted">
                  {item.quantity} x {formatSoles(item.unit_price)}
                </p>
              </div>
              <p className="font-black text-bosque-warmth">{formatSoles(item.quantity * item.unit_price)}</p>
            </div>
          ))}
          {selected.status === "pending_payment" ? (
            <button
              type="button"
              disabled={whatsappBusy}
              onClick={async () => {
                setWhatsappBusy(true);
                try {
                  window.open(await api.fetchOrderWhatsappUrl(selected.id), "_blank", "noopener");
                } catch (error) {
                  store.setMessage(error instanceof Error ? error.message : "No pude abrir WhatsApp.");
                } finally {
                  setWhatsappBusy(false);
                }
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-store-link bg-store-mint font-black text-store-link"
            >
              <Icon name="whatsapp" size={20} />
              Enviar por WhatsApp
            </button>
          ) : null}
          <YellowButton onClick={() => setSelected(null)} className="h-12 w-full !rounded-[16px]">
            Cerrar
          </YellowButton>
        </Modal>
      ) : null}
    </div>
  );
}
