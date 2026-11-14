import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as api from "@/lib/api";
import { currentPrice } from "@/lib/format";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Address, HomePromo, Order, Product, Profile, StoreSettings } from "@/lib/types";

// Equivalente a BosqueVivoStore() en MainActivity.kt: un solo estado para catálogo, sesión y carrito.

const GUEST_CART_KEY = "zeta-guest-cart";

type Cart = Record<string, number>;

type StoreState = {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  products: Product[]; // activos (lo que ve el cliente)
  allProducts: Product[]; // incluye ocultos si eres admin
  promos: HomePromo[];
  allPromos: HomePromo[];
  settings: StoreSettings | null;
  productsLoading: boolean;
  cart: Cart;
  cartCount: number;
  subtotal: number;
  saved: Set<string>;
  addresses: Address[];
  defaultAddress: Address | null;
  orders: Order[];
  message: string | null;
  toast: string | null;
  setMessage: (message: string | null) => void;
  showToast: (message: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (product: Product) => void;
  deleteFromCart: (product: Product) => void;
  saveForLater: (product: Product) => Promise<boolean>;
  removeSaved: (product: Product) => void;
  moveSavedToCart: (product: Product) => void;
  clearCart: (productIds: string[]) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  setSettings: (settings: StoreSettings) => void;
  savePhone: (phone: string) => Promise<void>;
  saveAddress: (address: Omit<Address, "id" | "user_id"> & { id?: string }) => Promise<void>;
  deleteAddress: (address: Address) => Promise<void>;
};

const StoreContext = createContext<StoreState | null>(null);

function readGuestCart(): Cart {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as Cart) : {};
  } catch {
    return {};
  }
}

function writeGuestCart(cart: Cart) {
  try {
    if (Object.keys(cart).length === 0) localStorage.removeItem(GUEST_CART_KEY);
    else localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    /* modo privado: el carrito vive solo en memoria */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allPromos, setAllPromos] = useState<HomePromo[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState<Cart>(() => readGuestCart());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const userId = session?.user.id ?? null;

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const refreshCatalog = useCallback(async () => {
    const [products, promos, storeSettings] = await Promise.all([
      api.fetchProducts(),
      api.fetchPromos(),
      api.fetchStoreSettings().catch(() => null),
    ]);
    setAllProducts(products);
    setAllPromos(promos);
    if (storeSettings) setSettings(storeSettings);
  }, []);

  // Catálogo público al abrir la tienda.
  useEffect(() => {
    if (!supabaseConfigured) {
      setMessage("Configura Supabase para cargar productos, anuncios e imágenes.");
      setProductsLoading(false);
      return;
    }
    refreshCatalog()
      .then(() => setMessage(null))
      .catch(() => setMessage("No pudimos cargar la tienda. Revisa tu conexión e intenta nuevamente."))
      .finally(() => setProductsLoading(false));
  }, [refreshCatalog]);

  // Sesión de Supabase (Google OAuth con PKCE).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!userId) return;
    setOrders(await api.fetchMyOrders(userId));
  }, [userId]);

  const refreshAccount = useCallback(async () => {
    if (!userId) return;
    const [freshProfile, freshAddresses] = await Promise.all([api.fetchProfile(userId), api.fetchAddresses(userId)]);
    setProfile(freshProfile);
    setAddresses(freshAddresses);
  }, [userId]);

  // Al iniciar sesión: perfil, carrito (se une con el de invitado), guardados, direcciones y pedidos.
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setSaved(new Set());
      setAddresses([]);
      setOrders([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [freshProfile, remoteCart, savedIds, freshAddresses, myOrders] = await Promise.all([
          api.fetchProfile(userId),
          api.fetchCart(userId),
          api.fetchSaved(userId),
          api.fetchAddresses(userId),
          api.fetchMyOrders(userId),
        ]);
        if (cancelled) return;
        const guest = readGuestCart();
        const merged: Cart = { ...remoteCart };
        for (const [productId, quantity] of Object.entries(guest)) merged[productId] = (merged[productId] ?? 0) + quantity;
        await Promise.all(Object.entries(guest).map(([productId]) => api.saveCartItem(userId, productId, merged[productId]!)));
        writeGuestCart({});
        setProfile(freshProfile);
        setCart(merged);
        setSaved(new Set(savedIds));
        setAddresses(freshAddresses);
        setOrders(myOrders);
        if (freshProfile?.role === "admin") await refreshCatalog(); // ve también productos y anuncios ocultos
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "No pude cargar tu cuenta.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshCatalog]);

  const persistCartItem = useCallback(
    (productId: string, quantity: number) => {
      if (!userId) return;
      const task = quantity > 0 ? api.saveCartItem(userId, productId, quantity) : api.deleteCartItem(userId, productId);
      task.catch((error) => setMessage(error instanceof Error ? error.message : "No pude actualizar el carrito."));
    },
    [userId],
  );

  const updateCart = useCallback(
    (productId: string, next: number) => {
      setCart((previous) => {
        const updated = { ...previous };
        if (next <= 0) delete updated[productId];
        else updated[productId] = next;
        if (!userId) writeGuestCart(updated);
        return updated;
      });
      persistCartItem(productId, next);
    },
    [persistCartItem, userId],
  );

  const addToCart = useCallback((product: Product) => updateCart(product.id, (cart[product.id] ?? 0) + 1), [cart, updateCart]);
  const removeFromCart = useCallback((product: Product) => updateCart(product.id, (cart[product.id] ?? 0) - 1), [cart, updateCart]);
  const deleteFromCart = useCallback((product: Product) => updateCart(product.id, 0), [updateCart]);

  const saveForLater = useCallback(
    async (product: Product) => {
      if (!userId) {
        setMessage("Inicia sesión para guardar productos.");
        return false;
      }
      setSaved((previous) => new Set(previous).add(product.id));
      updateCart(product.id, 0);
      try {
        await api.saveForLater(userId, product.id);
        setMessage("Producto guardado para después.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No pude guardar el producto.");
      }
      return true;
    },
    [updateCart, userId],
  );

  const removeSaved = useCallback(
    (product: Product) => {
      if (!userId) return;
      setSaved((previous) => {
        const next = new Set(previous);
        next.delete(product.id);
        return next;
      });
      api.deleteSaved(userId, product.id).catch((error) => setMessage(error instanceof Error ? error.message : "No pude quitar el producto guardado."));
    },
    [userId],
  );

  const moveSavedToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      removeSaved(product);
    },
    [addToCart, removeSaved],
  );

  const clearCart = useCallback(
    async (productIds: string[]) => {
      setCart((previous) => {
        const next = { ...previous };
        for (const id of productIds) delete next[id];
        return next;
      });
      if (userId) await Promise.all(productIds.map((id) => api.deleteCartItem(userId, id)));
    },
    [userId],
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/perfil` },
    });
    if (error) setMessage(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCart({});
    writeGuestCart({});
    setMessage("Sesión cerrada.");
  }, []);

  const savePhone = useCallback(
    async (phone: string) => {
      if (!userId) return;
      setProfile(await api.updateProfilePhone(userId, phone));
      setMessage("Teléfono guardado para tus pedidos.");
    },
    [userId],
  );

  const saveAddress = useCallback(
    async (address: Omit<Address, "id" | "user_id"> & { id?: string }) => {
      if (!userId) return;
      await api.saveAddress({ ...address, user_id: userId });
      await refreshAccount();
      setMessage("Dirección guardada para tus pedidos.");
    },
    [refreshAccount, userId],
  );

  const deleteAddress = useCallback(
    async (address: Address) => {
      await api.deleteAddress(address.id);
      await refreshAccount();
      setMessage("Dirección eliminada.");
    },
    [refreshAccount],
  );

  const products = useMemo(() => allProducts.filter((p) => p.is_active), [allProducts]);
  const promos = useMemo(() => allPromos.filter((p) => p.is_active), [allPromos]);
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, q) => sum + q, 0), [cart]);
  const subtotal = useMemo(() => products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * currentPrice(p), 0), [cart, products]);
  const defaultAddress = useMemo(() => addresses.find((a) => a.is_default) ?? addresses[0] ?? null, [addresses]);

  const value: StoreState = {
    ready,
    session,
    profile,
    isAdmin: profile?.role === "admin",
    products,
    allProducts,
    promos,
    allPromos,
    settings,
    productsLoading,
    cart,
    cartCount,
    subtotal,
    saved,
    addresses,
    defaultAddress,
    orders,
    message,
    toast,
    setMessage,
    showToast,
    addToCart,
    removeFromCart,
    deleteFromCart,
    saveForLater,
    removeSaved,
    moveSavedToCart,
    clearCart,
    signInWithGoogle,
    signOut,
    refreshCatalog,
    refreshAccount,
    refreshOrders,
    setSettings,
    savePhone,
    saveAddress,
    deleteAddress,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreState {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore debe usarse dentro de StoreProvider");
  return context;
}
