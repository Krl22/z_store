import { imageUploadEndpoint, supabase } from "./supabase";
import type {
  Address,
  AdminCustomer,
  AdminNotification,
  HomePromo,
  NotificationPreferences,
  Order,
  Product,
  Profile,
  StoreSettings,
} from "./types";

// Mismas consultas que z_store_android/app/.../data/SupabaseClient.kt.

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

const ORDER_SELECT = "*, order_items(*)";

// ---------- Catálogo ----------

export async function fetchProducts(): Promise<Product[]> {
  return check(await supabase.from("products").select("*").order("display_order").order("name")) as Product[];
}

export async function fetchPromos(): Promise<HomePromo[]> {
  return check(await supabase.from("home_promos").select("*").order("display_order")) as HomePromo[];
}

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  const rows = check(
    await supabase.from("store_settings").select("whatsapp_number, ad_rotation_seconds, low_stock_threshold").limit(1),
  ) as StoreSettings[];
  return rows[0] ?? null;
}

// ---------- Cuenta ----------

export async function fetchProfile(userId: string): Promise<Profile | null> {
  return check(await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()) as Profile | null;
}

export async function updateProfilePhone(userId: string, phone: string): Promise<Profile> {
  return check(await supabase.from("profiles").update({ phone }).eq("id", userId).select("*").single()) as Profile;
}

export async function fetchAddresses(userId: string): Promise<Address[]> {
  return check(
    await supabase.from("customer_addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at"),
  ) as Address[];
}

export async function saveAddress(address: Omit<Address, "id"> & { id?: string }): Promise<Address> {
  const row = { ...address, id: address.id || crypto.randomUUID() };
  return check(await supabase.from("customer_addresses").upsert(row, { onConflict: "id" }).select("*").single()) as Address;
}

export async function deleteAddress(id: string): Promise<void> {
  check(await supabase.from("customer_addresses").delete().eq("id", id));
}

export async function fetchCart(userId: string): Promise<Record<string, number>> {
  const rows = check(await supabase.from("cart_items").select("product_id, quantity").eq("user_id", userId)) as {
    product_id: string;
    quantity: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.product_id, Math.max(1, r.quantity)]));
}

export async function saveCartItem(userId: string, productId: string, quantity: number): Promise<void> {
  check(
    await supabase
      .from("cart_items")
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: "user_id,product_id" }),
  );
}

export async function deleteCartItem(userId: string, productId: string): Promise<void> {
  check(await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId));
}

export async function fetchSaved(userId: string): Promise<string[]> {
  const rows = check(await supabase.from("saved_products").select("product_id").eq("user_id", userId)) as { product_id: string }[];
  return rows.map((r) => r.product_id);
}

export async function saveForLater(userId: string, productId: string): Promise<void> {
  check(await supabase.from("saved_products").upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" }));
}

export async function deleteSaved(userId: string, productId: string): Promise<void> {
  check(await supabase.from("saved_products").delete().eq("user_id", userId).eq("product_id", productId));
}

// ---------- Pedidos ----------

export async function createOrder(
  items: { product_id: string; product_name: string; quantity: number }[],
  addressId: string | null,
  deliveryMethod: "delivery" | "pickup",
): Promise<string> {
  const id = check(
    await supabase.rpc("create_order_with_items", {
      p_items: items,
      p_address_id: addressId,
      p_delivery_method: deliveryMethod,
    }),
  ) as string;
  return id;
}

export async function fetchOrder(id: string): Promise<Order | null> {
  return check(await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle()) as Order | null;
}

export async function fetchMyOrders(userId: string): Promise<Order[]> {
  return check(
    await supabase.from("orders").select(ORDER_SELECT).eq("user_id", userId).order("created_at", { ascending: false }),
  ) as Order[];
}

/** Link wa.me con el resumen del pedido; el número y el texto los arma Supabase (order_whatsapp_message). */
export async function fetchOrderWhatsappUrl(orderId: string): Promise<string> {
  const message = check(await supabase.rpc("order_whatsapp_message", { p_order_id: orderId })) as { phone: string; text: string };
  const phone = (message.phone ?? "").replace(/\D/g, "");
  if (!phone) throw new Error("La tienda no tiene un WhatsApp configurado.");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message.text ?? "")}`;
}

// ---------- Admin ----------

export async function fetchAdminOrders(): Promise<Order[]> {
  return check(await supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false })) as Order[];
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  check(await supabase.from("orders").update({ status }).eq("id", id));
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  return check(
    await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(30),
  ) as AdminNotification[];
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  check(await supabase.from("admin_notifications").update({ is_read: true }).in("id", ids));
}

export async function saveProduct(product: Product): Promise<void> {
  check(await supabase.from("products").upsert(product, { onConflict: "id" }));
}

export async function deleteProduct(id: string): Promise<void> {
  check(await supabase.from("products").delete().eq("id", id));
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
  check(await supabase.from("products").update({ stock: Math.max(0, stock) }).eq("id", id));
}

export async function savePromo(promo: HomePromo): Promise<void> {
  check(await supabase.from("home_promos").upsert(promo, { onConflict: "id" }));
}

export async function deletePromo(id: string): Promise<void> {
  check(await supabase.from("home_promos").delete().eq("id", id));
}

export async function fetchCustomers(): Promise<AdminCustomer[]> {
  return check(await supabase.rpc("admin_list_customers")) as AdminCustomer[];
}

export async function setCustomerAdmin(userId: string, isAdmin: boolean): Promise<void> {
  check(await supabase.rpc("admin_set_role", { p_user_id: userId, p_is_admin: isAdmin }));
}

export async function resetCustomer(userId: string, scope: "cart" | "account"): Promise<void> {
  check(await supabase.rpc("admin_reset_customer", { p_user_id: userId, p_scope: scope }));
}

export async function deleteCustomer(userId: string): Promise<void> {
  check(await supabase.rpc("admin_delete_customer", { p_user_id: userId }));
}

export async function updateStoreSettings(settings: StoreSettings): Promise<void> {
  check(await supabase.from("store_settings").update(settings).eq("id", true));
}

export async function fetchNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const row = check(
    await supabase.from("admin_notification_preferences").select("enabled, new_orders, new_customers, low_stock").eq("admin_id", userId).maybeSingle(),
  ) as NotificationPreferences | null;
  return row ?? { enabled: true, new_orders: true, new_customers: true, low_stock: true };
}

export async function saveNotificationPreferences(userId: string, prefs: NotificationPreferences): Promise<void> {
  check(await supabase.from("admin_notification_preferences").upsert({ admin_id: userId, ...prefs }, { onConflict: "admin_id" }));
}

/** Sube una imagen al Worker de Cloudflare (R2); solo admins. Misma ruta que usa la app. */
export async function uploadStoreImage(file: File, folder: "products" | "promos", slug: string): Promise<string> {
  if (!imageUploadEndpoint) throw new Error("Falta configurar el endpoint de imágenes.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Inicia sesión para subir imágenes.");

  const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : file.type.split("/")[1] ?? "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "imagen";
  const path = `${folder}/${slug}/${Date.now()}-${baseName}.${extension}`;

  const response = await fetch(`${imageUploadEndpoint}/upload?path=${encodeURIComponent(path)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !body.url) throw new Error(body.error || `Cloudflare respondió con error ${response.status}`);
  return body.url;
}
