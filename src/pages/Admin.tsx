import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import {
  Grid,
  List as ListIcon,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
// import { Switch } from "../components/ui/switch"
import { db, storage } from "../lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type ProductFormState = {
  nombre: string;
  tipo: string;
  categoria: string;
  subcategoria: string;
  hongo: string;
  stock: number;
  unidad: string;
  precio: number;
  imageFile?: File | null;
  imageUrl?: string;
  descripcion: string;
};

type ProductDoc = {
  id: string;
  nombre?: string;
  tipo?: string;
  categoria?: string;
  subcategoria?: string;
  hongo?: string;
  stock?: number;
  unidad?: string;
  precio?: number;
  image?: string;
  descripcion?: string;
  updatedAt?: number;
  createdAt?: number;
};

type OrderItem = {
  ID: string;
  Nombre: string;
  precio: number | string;
  image: string;
  cantidad: number;
};

type OrderDoc = {
  id: string;
  orderId: string;
  userId: string;
  userEmail?: string | null;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  captureUrl?: string;
  status: "pending_review" | "approved" | "rejected" | string;
  createdAt: number;
  profile?: {
    nombre?: string;
    apellido?: string;
    provincia?: string;
    telefono?: string;
  } | null;
};

export function Admin() {
  const [tab, setTab] = useState<"products" | "orders" | "admins">("products");

  // Taxonomías
  const [tipos, setTipos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [unidades, setUnidades] = useState<string[]>([]);
  const [hongos, setHongos] = useState<string[]>([]);

  // Productos
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>({
    nombre: "",
    tipo: "",
    categoria: "",
    subcategoria: "",
    hongo: "",
    stock: 0,
    unidad: "",
    precio: 0,
    imageFile: null,
    imageUrl: "",
    descripcion: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Admins
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      // Cargar taxonomías
      const tiposSnap = await getDocs(collection(db, "types"));
      setTipos(tiposSnap.docs.map((d) => d.id));
      const categoriasSnap = await getDocs(collection(db, "categories"));
      setCategorias(categoriasSnap.docs.map((d) => d.id));
      const subcategoriasSnap = await getDocs(collection(db, "subcategories"));
      setSubcategorias(subcategoriasSnap.docs.map((d) => d.id));
      const unidadesSnap = await getDocs(collection(db, "units"));
      setUnidades(unidadesSnap.docs.map((d) => d.id));

      const hongosSnap = await getDocs(collection(db, "hongos"));
      setHongos(hongosSnap.docs.map((d) => d.id));

      // Cargar productos
      const productsSnap = await getDocs(collection(db, "products"));
      setProducts(
        productsSnap.docs.map((d) => {
          const data = d.data() as Omit<ProductDoc, "id">;
          return { id: d.id, ...data };
        })
      );

      // Cargar órdenes
      const ordersSnap = await getDocs(collection(db, "orders"));
      setOrders(
        ordersSnap.docs.map((d) => {
          const data = d.data() as Omit<OrderDoc, "id">;
          return { id: d.id, ...data };
        })
      );

      // Cargar admins
      const adminsSnap = await getDocs(collection(db, "admins"));
      setAdmins(adminsSnap.docs.map((d) => d.id));
    };
    loadAll();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map((d) => {
          const data = d.data() as Omit<OrderDoc, "id">;
          return { id: d.id, ...data };
        })
      );
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm({
      nombre: "",
      tipo: "",
      categoria: "",
      subcategoria: "",
      hongo: "",
      stock: 0,
      unidad: "",
      precio: 0,
      imageFile: null,
      imageUrl: "",
      descripcion: "",
    });
    setEditingId(null);
  };

  const handleSaveProduct = async () => {
    if (!form.nombre) return;
    setLoading(true);
    try {
      let targetId = editingId;
      if (!targetId) {
        const provisionalRef = doc(collection(db, "products"));
        targetId = provisionalRef.id;
        let imageUrl = form.imageUrl || "";
        if (form.imageFile) {
          const storageRef = ref(storage, `products/${targetId}-${Date.now()}`);
          const uploadRes = await uploadBytes(storageRef, form.imageFile);
          imageUrl = await getDownloadURL(uploadRes.ref);
        }
        await setDoc(provisionalRef, {
          nombre: form.nombre,
          tipo: form.tipo,
          categoria: form.categoria,
          subcategoria: form.subcategoria,
          hongo: form.hongo,
          stock: form.stock,
          unidad: form.unidad,
          precio: form.precio,
          image: imageUrl,
          descripcion: form.descripcion,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        let imageUrl = form.imageUrl || "";
        if (form.imageFile) {
          const storageRef = ref(storage, `products/${targetId}-${Date.now()}`);
          const uploadRes = await uploadBytes(storageRef, form.imageFile);
          imageUrl = await getDownloadURL(uploadRes.ref);
        }
        await setDoc(
          doc(db, "products", targetId),
          {
            nombre: form.nombre,
            tipo: form.tipo,
            categoria: form.categoria,
            subcategoria: form.subcategoria,
            hongo: form.hongo,
            stock: form.stock,
            unidad: form.unidad,
            precio: form.precio,
            image: imageUrl,
            descripcion: form.descripcion,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }

      const productsSnap = await getDocs(collection(db, "products"));
      setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (p: ProductDoc) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre || "",
      tipo: p.tipo || "",
      categoria: p.categoria || "",
      subcategoria: p.subcategoria || "",
      hongo: p.hongo || "",
      stock: Number(p.stock || 0),
      unidad: p.unidad || "",
      precio: Number(p.precio || 0),
      imageFile: null,
      imageUrl: p.image || "",
      descripcion: p.descripcion || "",
    });
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    const productsSnap = await getDocs(collection(db, "products"));
    setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addTaxonomyItem = async (
    col: "types" | "categories" | "subcategories" | "units" | "hongos",
    value: string
  ) => {
    if (!value) return;
    await setDoc(doc(db, col, value), { value });
    const snap = await getDocs(collection(db, col));
    const list = snap.docs.map((d) => d.id);
    if (col === "types") setTipos(list);
    if (col === "categories") setCategorias(list);
    if (col === "subcategories") setSubcategorias(list);
    if (col === "units") setUnidades(list);
    if (col === "hongos") setHongos(list);
  };

  const removeTaxonomyItem = async (
    col: "types" | "categories" | "subcategories" | "units" | "hongos",
    id: string
  ) => {
    await deleteDoc(doc(db, col, id));
    const snap = await getDocs(collection(db, col));
    const list = snap.docs.map((d) => d.id);
    if (col === "types") setTipos(list);
    if (col === "categories") setCategorias(list);
    if (col === "subcategories") setSubcategorias(list);
    if (col === "units") setUnidades(list);
    if (col === "hongos") setHongos(list);
  };

  const addAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    await setDoc(doc(db, "admins", email), { email, createdAt: Date.now() });
    const adminsSnap = await getDocs(collection(db, "admins"));
    setAdmins(adminsSnap.docs.map((d) => d.id));
    setNewAdminEmail("");
  };

  const revokeAdmin = async (email: string) => {
    await deleteDoc(doc(db, "admins", email));
    const adminsSnap = await getDocs(collection(db, "admins"));
    setAdmins(adminsSnap.docs.map((d) => d.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-amber-900/30 dark:text-amber-300">
            <span className="size-2 rounded-full bg-emerald-500 dark:bg-amber-400"></span>
            <span className="text-xs font-semibold tracking-wide">
              Admin Panel
            </span>
          </div>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-emerald-800 dark:text-amber-300">
            Panel de Administración
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra productos, listas y administradores con un diseño moderno
            y adaptado a tu tema.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            className={
              tab === "products"
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : ""
            }
            variant={tab === "products" ? "default" : "outline"}
            onClick={() => setTab("products")}
          >
            Productos
          </Button>
          <Button
            className={
              tab === "orders"
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : ""
            }
            variant={tab === "orders" ? "default" : "outline"}
            onClick={() => setTab("orders")}
          >
            Pedidos
          </Button>
          <Button
            className={
              tab === "admins"
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : ""
            }
            variant={tab === "admins" ? "default" : "outline"}
            onClick={() => setTab("admins")}
          >
            Administradores
          </Button>
        </div>

        <Separator className="my-4" />

        {tab === "products" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-1 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Nuevo producto
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    placeholder="Nombre del producto"
                    className="focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <select
                      id="tipo"
                      value={form.tipo}
                      onChange={(e) =>
                        setForm({ ...form, tipo: e.target.value })
                      }
                      className="w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecciona tipo</option>
                      {tipos.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <select
                      id="categoria"
                      value={form.categoria}
                      onChange={(e) =>
                        setForm({ ...form, categoria: e.target.value })
                      }
                      className="w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecciona categoría</option>
                      {categorias.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subcategoria">Subcategoría</Label>
                    <select
                      id="subcategoria"
                      value={form.subcategoria}
                      onChange={(e) =>
                        setForm({ ...form, subcategoria: e.target.value })
                      }
                      className="w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecciona subcategoría</option>
                      {subcategorias.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hongo">Hongo</Label>
                    <select
                      id="hongo"
                      value={form.hongo}
                      onChange={(e) =>
                        setForm({ ...form, hongo: e.target.value })
                      }
                      className="w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecciona hongo</option>
                      {hongos.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                      }
                      placeholder="0"
                      className="focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidad">Unidad</Label>
                    <select
                      id="unidad"
                      value={form.unidad}
                      onChange={(e) =>
                        setForm({ ...form, unidad: e.target.value })
                      }
                      className="w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecciona unidad</option>
                      {unidades.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={form.precio}
                      onChange={(e) =>
                        setForm({ ...form, precio: Number(e.target.value) })
                      }
                      placeholder="0.00"
                      className="focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Imagen (Storage)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        imageFile: e.target.files?.[0] || null,
                      })
                    }
                    className="focus:ring-emerald-500"
                  />
                  {form.imageUrl && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                      URL actual:{" "}
                      <span className="text-emerald-700 dark:text-amber-300">
                        {form.imageUrl}
                      </span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <textarea
                    id="descripcion"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    className="w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={4}
                    placeholder="Descripción del producto"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                    onClick={handleSaveProduct}
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar producto"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-200 dark:border-emerald-800"
                    onClick={resetForm}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Productos
                </h2>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Buscar productos"
                    className="w-56 focus:ring-emerald-500"
                  />
                  <Button
                    variant="outline"
                    className="border-emerald-200 dark:border-emerald-800"
                  >
                    Filtrar
                  </Button>
                  <div className="ml-2 flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        viewMode === "cards"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : ""
                      } border-emerald-200 dark:border-emerald-800`}
                      onClick={() => setViewMode("cards")}
                      aria-label="Vista de tarjetas"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        viewMode === "list"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : ""
                      } border-emerald-200 dark:border-emerald-800`}
                      onClick={() => setViewMode("list")}
                      aria-label="Vista de lista"
                    >
                      <ListIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <Card
                      key={p.id}
                      className="p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/40"
                    >
                      <div className="aspect-square rounded-md bg-muted mb-3 overflow-hidden">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {p.nombre}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {p.categoria && (
                              <Badge variant="secondary" className="text-xs">
                                {p.categoria}
                              </Badge>
                            )}
                            {p.subcategoria && (
                              <Badge variant="outline" className="text-xs">
                                {p.subcategoria}
                              </Badge>
                            )}
                            {p.hongo && (
                              <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {p.hongo}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-200 dark:border-emerald-800"
                            onClick={() => handleEditProduct(p)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-emerald-100 dark:border-emerald-800/40 p-3 bg-white/80 dark:bg-gray-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {p.nombre}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {p.categoria && (
                              <Badge variant="secondary" className="text-xs">
                                {p.categoria}
                              </Badge>
                            )}
                            {p.subcategoria && (
                              <Badge variant="outline" className="text-xs">
                                {p.subcategoria}
                              </Badge>
                            )}
                            {p.hongo && (
                              <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {p.hongo}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {typeof p.precio !== "undefined" && (
                          <span className="text-sm font-semibold text-emerald-700 dark:text-amber-300">
                            S/{p.precio}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-200 dark:border-emerald-800"
                          onClick={() => handleEditProduct(p)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : tab === "orders" ? (
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pedidos
                </h2>
              </div>
              <div className="space-y-2">
                {orders.length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No hay pedidos aún.
                  </p>
                )}
                {orders.map((o) => (
                  <>
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-lg border border-emerald-100 dark:border-emerald-800/40 p-3 bg-white/80 dark:bg-gray-900/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-muted">
                          {o.captureUrl ? (
                            <img
                              src={o.captureUrl}
                              alt="captura"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {o.profile?.nombre && o.profile?.apellido
                              ? `${o.profile.nombre} ${o.profile.apellido}`
                              : o.userEmail || o.userId}
                          </p>
                          {o.userEmail && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              Email: {o.userEmail}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total: S/
                            {o.total?.toFixed ? o.total.toFixed(2) : o.total}
                          </p>
                          {o.profile && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-x-2">
                              <span>Prov.: {o.profile.provincia}</span>
                              <span>Tel.: {o.profile.telefono}</span>
                            </div>
                          )}
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {o.paymentMethod}
                            </Badge>
                            {(() => {
                              const statusVariant:
                                | "secondary"
                                | "destructive"
                                | "outline" =
                                o.status === "approved"
                                  ? "secondary"
                                  : o.status === "rejected"
                                  ? "destructive"
                                  : "outline";
                              return (
                                <Badge
                                  variant={statusVariant}
                                  className="text-xs capitalize"
                                >
                                  {String(o.status).replace("_", " ")}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {o.captureUrl && (
                          <a
                            href={o.captureUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800"
                          >
                            <Eye className="h-4 w-4" /> Ver
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-200 dark:border-emerald-800"
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === o.id ? null : o.id
                            )
                          }
                        >
                          <ChevronDown
                            className={`h-4 w-4 mr-1 ${
                              expandedOrderId === o.id ? "rotate-180" : ""
                            }`}
                          />{" "}
                          Items
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={async () => {
                            await setDoc(
                              doc(db, "orders", o.id),
                              { status: "approved", updatedAt: Date.now() },
                              { merge: true }
                            );
                            const ordersSnap = await getDocs(
                              collection(db, "orders")
                            );
                            setOrders(
                              ordersSnap.docs.map((d) => {
                                const data = d.data() as Omit<OrderDoc, "id">;
                                return { id: d.id, ...data };
                              })
                            );
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={async () => {
                            await setDoc(
                              doc(db, "orders", o.id),
                              { status: "rejected", updatedAt: Date.now() },
                              { merge: true }
                            );
                            const ordersSnap = await getDocs(
                              collection(db, "orders")
                            );
                            setOrders(
                              ordersSnap.docs.map((d) => {
                                const data = d.data() as Omit<OrderDoc, "id">;
                                return { id: d.id, ...data };
                              })
                            );
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Rechazar
                        </Button>
                      </div>
                    </div>
                    {expandedOrderId === o.id && o.items && (
                      <div className="mt-3 rounded-lg border border-emerald-100 dark:border-emerald-800/40 p-3 bg-white/70 dark:bg-gray-900/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {o.items.map((it: OrderItem) => (
                            <div
                              key={it.ID}
                              className="flex items-center gap-3"
                            >
                              <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                {it.image ? (
                                  <img
                                    src={it.image}
                                    alt={it.Nombre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {it.Nombre}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {(() => {
                                    const price =
                                      typeof it.precio === "number"
                                        ? it.precio
                                        : parseFloat(it.precio);
                                    const subtotal = price * it.cantidad;
                                    return `Cant: ${
                                      it.cantidad
                                    } • Precio: S/${price.toFixed(
                                      2
                                    )} • Subtotal: S/${subtotal.toFixed(2)}`;
                                  })()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-1 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Agregar administrador
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="correo@dominio.com"
                    className="focus:ring-emerald-500"
                  />
                </div>
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={addAdmin}
                >
                  Agregar
                </Button>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Se creará/gestionará la colección{" "}
                  <span className="font-semibold">admins</span> en Firestore.
                </p>
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Administradores
                </h2>
                <Input placeholder="Buscar administradores" className="w-56" />
              </div>
              <div className="space-y-3">
                {admins.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-md border border-emerald-100 dark:border-emerald-800/40 p-3 bg-white/80 dark:bg-gray-900/60"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Acceso completo
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 dark:border-emerald-800"
                        onClick={() => revokeAdmin(email)}
                      >
                        Revocar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Configuración de listas (Tipos, Categorías, Subcategorías, Unidades, Hongos) */}
        {tab === "products" && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tipos
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Nuevo tipo"
                  id="new-tipo"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addTaxonomyItem(
                        "types",
                        (e.target as HTMLInputElement).value
                      );
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={async () => {
                    const el = document.getElementById(
                      "new-tipo"
                    ) as HTMLInputElement;
                    await addTaxonomyItem("types", el.value);
                    el.value = "";
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tipos.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Badge variant="secondary">{t}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => removeTaxonomyItem("types", t)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Categorías
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Nueva categoría"
                  id="new-categoria"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addTaxonomyItem(
                        "categories",
                        (e.target as HTMLInputElement).value
                      );
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={async () => {
                    const el = document.getElementById(
                      "new-categoria"
                    ) as HTMLInputElement;
                    await addTaxonomyItem("categories", el.value);
                    el.value = "";
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categorias.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <Badge variant="secondary">{c}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => removeTaxonomyItem("categories", c)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Subcategorías
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Nueva subcategoría"
                  id="new-subcategoria"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addTaxonomyItem(
                        "subcategories",
                        (e.target as HTMLInputElement).value
                      );
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={async () => {
                    const el = document.getElementById(
                      "new-subcategoria"
                    ) as HTMLInputElement;
                    await addTaxonomyItem("subcategories", el.value);
                    el.value = "";
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {subcategorias.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <Badge variant="secondary">{s}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => removeTaxonomyItem("subcategories", s)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Unidades
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Nueva unidad"
                  id="new-unidad"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addTaxonomyItem(
                        "units",
                        (e.target as HTMLInputElement).value
                      );
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={async () => {
                    const el = document.getElementById(
                      "new-unidad"
                    ) as HTMLInputElement;
                    await addTaxonomyItem("units", el.value);
                    el.value = "";
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {unidades.map((u) => (
                  <div key={u} className="flex items-center gap-2">
                    <Badge variant="secondary">{u}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => removeTaxonomyItem("units", u)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Hongos
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Nuevo hongo"
                  id="new-hongo"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addTaxonomyItem(
                        "hongos",
                        (e.target as HTMLInputElement).value
                      );
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={async () => {
                    const el = document.getElementById(
                      "new-hongo"
                    ) as HTMLInputElement;
                    await addTaxonomyItem("hongos", el.value);
                    el.value = "";
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hongos.map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <Badge variant="secondary">{h}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => removeTaxonomyItem("hongos", h)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
