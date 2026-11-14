// Mismas tablas que usa la app Android (z_store_android/app/.../data).

export type Product = {
  id: string;
  name: string;
  latin_name: string | null;
  format: string | null;
  category: string;
  price: number;
  offer_price: number | null;
  is_featured_offer: boolean;
  tag: string | null;
  rating: number;
  color_hex: string;
  accent_hex: string;
  benefits: string[];
  stock: number;
  image_keys: string[];
  image_urls: string[];
  is_active: boolean;
  display_order: number;
};

export type HomePromo = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  color_hexes: string[];
  image_key: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export type StoreSettings = {
  whatsapp_number: string;
  ad_rotation_seconds: number;
  low_stock_threshold: number;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  default_address_id: string | null;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  district: string;
  city: string;
  country: string;
  reference: string;
  is_default: boolean;
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url: string;
};

export type OrderStatus = "pending_payment" | "paid" | "preparing" | "ready" | "completed" | "cancelled";

export type Order = {
  id: string;
  user_id: string | null;
  customer_email: string;
  status: OrderStatus;
  payment_status: string;
  subtotal: number;
  total: number;
  address_id: string | null;
  delivery_method: "delivery" | "pickup";
  delivery_status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address_snapshot: Record<string, string>;
  created_at: string;
  order_items: OrderItem[];
};

export type AdminNotification = {
  id: string;
  order_id: string | null;
  kind: "order" | "customer" | "stock";
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type AdminCustomer = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  providers: string[];
  orders_count: number;
  pending_orders_count: number;
  total_paid: number;
  last_order_at: string | null;
  addresses_count: number;
  cart_units: number;
};

export type NotificationPreferences = {
  enabled: boolean;
  new_orders: boolean;
  new_customers: boolean;
  low_stock: boolean;
};
