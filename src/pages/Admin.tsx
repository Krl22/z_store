import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  Database,
  Edit3,
  ImagePlus,
  Megaphone,
  Package,
  Save,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { db, storage } from "@/lib/firebase";
import {
  catalogCollections,
  defaultStoreContent,
  formatCurrency,
  higgsfieldCreativePrompts,
  StoreCategory,
  StoreProduct,
  StorePromotion,
  StorefrontContent,
} from "@/lib/storefront-v2";
import {
  fetchStorefrontV2,
  seedDemoStorefrontV2,
} from "@/services/storefrontV2Service";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type Tab =
  | "overview"
  | "products"
  | "promotions"
  | "content"
  | "categories"
  | "orders"
  | "admins"
  | "creative";

type ProductForm = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  species: string;
  format: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  unit: string;
  image: string;
  imageFile: File | null;
  shortDescription: string;
  description: string;
  badges: string;
  benefits: string;
  ingredients: string;
  ritualTip: string;
  promotionId: string;
  featured: boolean;
  status: StoreProduct["status"];
};

type CategoryForm = StoreCategory;

type PromotionForm = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountLabel: string;
  productIds: string;
  status: StorePromotion["status"];
  startsAt: string;
  endsAt: string;
};

type OrderDoc = {
  id: string;
  orderId?: string;
  userEmail?: string | null;
  total?: number;
  status?: string;
  createdAt?: number;
  items?: Array<{ ID: string; Nombre: string; cantidad: number; precio: string }>;
};

const emptyProductForm: ProductForm = {
  id: "",
  slug: "",
  name: "",
  categoryId: "focus",
  species: "",
  format: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  unit: "unidad",
  image: "",
  imageFile: null,
  shortDescription: "",
  description: "",
  badges: "",
  benefits: "",
  ingredients: "",
  ritualTip: "",
  promotionId: "",
  featured: true,
  status: "active",
};

const emptyCategoryForm: CategoryForm = {
  id: "",
  name: "",
  description: "",
  image: "",
  featured: true,
  order: 10,
};

const emptyPromotionForm: PromotionForm = {
  id: "",
  title: "",
  subtitle: "",
  code: "",
  discountLabel: "",
  productIds: "",
  status: "active",
  startsAt: "",
  endsAt: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value: string[]) {
  return value.join(", ");
}

function productToForm(product: StoreProduct): ProductForm {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.categoryId,
    species: product.species,
    format: product.format,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: String(product.stock),
    unit: product.unit,
    image: product.image,
    imageFile: null,
    shortDescription: product.shortDescription,
    description: product.description,
    badges: joinList(product.badges),
    benefits: joinList(product.benefits),
    ingredients: joinList(product.ingredients),
    ritualTip: product.ritualTip,
    promotionId: product.promotionId || "",
    featured: product.featured,
    status: product.status,
  };
}

function promotionToForm(promotion: StorePromotion): PromotionForm {
  return {
    id: promotion.id,
    title: promotion.title,
    subtitle: promotion.subtitle,
    code: promotion.code,
    discountLabel: promotion.discountLabel,
    productIds: joinList(promotion.productIds),
    status: promotion.status,
    startsAt: promotion.startsAt || "",
    endsAt: promotion.endsAt || "",
  };
}

export function Admin() {
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [promotions, setPromotions] = useState<StorePromotion[]>([]);
  const [content, setContent] = useState<StorefrontContent>(defaultStoreContent);
  const [usingDemo, setUsingDemo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);
  const [promotionForm, setPromotionForm] =
    useState<PromotionForm>(emptyPromotionForm);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products]
  );

  const activePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.status === "active"),
    [promotions]
  );

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + product.stock, 0),
    [products]
  );

  const refreshStore = async () => {
    const data = await fetchStorefrontV2();
    setProducts(data.products);
    setCategories(data.categories);
    setPromotions(data.promotions);
    setContent(data.content);
    setUsingDemo(data.usingDemo);
  };

  useEffect(() => {
    refreshStore();

    const ordersUnsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map((item) => ({ id: item.id, ...item.data() } as OrderDoc))
      );
    });

    const loadAdmins = async () => {
      const snap = await getDocs(collection(db, "admins"));
      setAdmins(snap.docs.map((item) => item.id));
    };
    loadAdmins();

    return () => ordersUnsub();
  }, []);

  const showMessage = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 3500);
  };

  const handleSeedDemo = async () => {
    setSaving(true);
    try {
      await seedDemoStorefrontV2();
      await refreshStore();
      showMessage("Demo V2 sembrada en Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const uploadProductImage = async (productId: string) => {
    if (!productForm.imageFile) return productForm.image;
    const storageRef = ref(
      storage,
      `store-products-v2/${productId}-${Date.now()}`
    );
    const upload = await uploadBytes(storageRef, productForm.imageFile);
    return getDownloadURL(upload.ref);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim()) return;
    setSaving(true);
    try {
      const id = productForm.id || slugify(productForm.name);
      const slug = productForm.slug || slugify(productForm.name);
      const image = await uploadProductImage(id);
      const payload: StoreProduct = {
        id,
        slug,
        name: productForm.name.trim(),
        categoryId: productForm.categoryId,
        species: productForm.species,
        format: productForm.format,
        price: Number(productForm.price) || 0,
        compareAtPrice: productForm.compareAtPrice
          ? Number(productForm.compareAtPrice)
          : undefined,
        stock: Number(productForm.stock) || 0,
        unit: productForm.unit,
        image,
        shortDescription: productForm.shortDescription,
        description: productForm.description,
        badges: splitList(productForm.badges),
        benefits: splitList(productForm.benefits),
        ingredients: splitList(productForm.ingredients),
        ritualTip: productForm.ritualTip,
        promotionId: productForm.promotionId || undefined,
        featured: productForm.featured,
        status: productForm.status,
        updatedAt: Date.now(),
        createdAt:
          products.find((product) => product.id === id)?.createdAt || Date.now(),
      };
      await setDoc(doc(db, catalogCollections.products, id), payload);
      setProductForm(emptyProductForm);
      await refreshStore();
      showMessage("Producto guardado.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, catalogCollections.products, id));
    await refreshStore();
    showMessage("Producto eliminado.");
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return;
    const id = categoryForm.id || slugify(categoryForm.name);
    await setDoc(doc(db, catalogCollections.categories, id), {
      ...categoryForm,
      id,
    });
    setCategoryForm(emptyCategoryForm);
    await refreshStore();
    showMessage("Categoria guardada.");
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, catalogCollections.categories, id));
    await refreshStore();
    showMessage("Categoria eliminada.");
  };

  const savePromotion = async () => {
    if (!promotionForm.title.trim()) return;
    const id = promotionForm.id || slugify(promotionForm.title);
    const payload: StorePromotion = {
      id,
      title: promotionForm.title,
      subtitle: promotionForm.subtitle,
      code: promotionForm.code,
      discountLabel: promotionForm.discountLabel,
      productIds: splitList(promotionForm.productIds),
      status: promotionForm.status,
      startsAt: promotionForm.startsAt || undefined,
      endsAt: promotionForm.endsAt || undefined,
    };
    await setDoc(doc(db, catalogCollections.promotions, id), payload);
    setPromotionForm(emptyPromotionForm);
    await refreshStore();
    showMessage("Promocion guardada.");
  };

  const deletePromotion = async (id: string) => {
    await deleteDoc(doc(db, catalogCollections.promotions, id));
    await refreshStore();
    showMessage("Promocion eliminada.");
  };

  const saveContent = async () => {
    await setDoc(doc(db, catalogCollections.content, "main"), content);
    await refreshStore();
    showMessage("Contenido actualizado.");
  };

  const addAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    await setDoc(doc(db, "admins", email), { email, createdAt: Date.now() });
    setAdmins((previous) => Array.from(new Set([...previous, email])));
    setNewAdminEmail("");
    showMessage("Administrador agregado.");
  };

  const revokeAdmin = async (email: string) => {
    await deleteDoc(doc(db, "admins", email));
    setAdmins((previous) => previous.filter((item) => item !== email));
    showMessage("Acceso revocado.");
  };

  const tabs: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Productos", icon: Package },
    { id: "promotions", label: "Promos", icon: Megaphone },
    { id: "content", label: "Contenido", icon: Settings },
    { id: "categories", label: "Categorias", icon: Tags },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "admins", label: "Admins", icon: Users },
    { id: "creative", label: "Higgsfield", icon: Sparkles },
  ];

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 pb-12 pt-28 text-[#153328] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge className="bg-[#153328] text-white">Admin V2</Badge>
            <h1 className="mt-3 text-4xl font-semibold">
              Panel de administracion
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6f65]">
              Gestiona catalogo, promociones, contenido visible, categorias y
              accesos desde una estructura lista para entregar al cliente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
              disabled={saving}
              onClick={handleSeedDemo}
            >
              <Database className="h-4 w-4" />
              Sembrar demo V2
            </Button>
          </div>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-[#d8b56d]/40 bg-[#fff8e6] p-3 text-sm text-[#6a5122]">
            {message}
          </div>
        )}

        {usingDemo && (
          <div className="mb-4 rounded-lg border border-[#d8b56d]/40 bg-white p-4 text-sm text-[#5d6f65]">
            Firestore aun no tiene catalogo V2 completo. La tienda esta usando
            datos demo hasta que siembres o guardes productos reales.
          </div>
        )}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((item) => (
            <Button
              key={item.id}
              variant={tab === item.id ? "default" : "outline"}
              className={
                tab === item.id
                  ? "rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
                  : "rounded-lg border-[#cdbf9e] bg-white"
              }
              onClick={() => setTab(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  label: "Productos activos",
                  value: activeProducts.length,
                  helper: `${products.length} totales`,
                },
                {
                  label: "Stock total",
                  value: totalStock,
                  helper: "Unidades disponibles",
                },
                {
                  label: "Promos activas",
                  value: activePromotions.length,
                  helper: `${promotions.length} campanas`,
                },
                {
                  label: "Pedidos recibidos",
                  value: orders.length,
                  helper: "Coleccion orders",
                },
              ].map((metric) => (
                <Card key={metric.label} className="rounded-lg bg-white p-5">
                  <p className="text-sm text-[#5d6f65]">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                  <p className="mt-1 text-xs text-[#89968d]">{metric.helper}</p>
                </Card>
              ))}
            </div>

            <Card className="rounded-lg bg-[#153328] p-6 text-white">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#f5d58b]">
                    Estado comercial
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">
                    La V2 esta pensada para operar sin checkout.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    El carrito arma el pedido y lo envia por WhatsApp. Cuando
                    toque transacciones, esta estructura ya separa contenido,
                    productos, promos y ordenes.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    "Editar hero y WhatsApp",
                    "Publicar o pausar productos",
                    "Crear bundles y codigos",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-white/15 bg-white/10 p-4"
                    >
                      <Sparkles className="h-5 w-5 text-[#f5d58b]" />
                      <p className="mt-4 text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "products" && (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="rounded-lg bg-white p-5">
              <h2 className="text-xl font-semibold">
                {productForm.id ? "Editar producto" : "Nuevo producto"}
              </h2>
              <div className="mt-5 grid gap-4">
                <Field label="Nombre">
                  <Input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        name: event.target.value,
                        slug: form.slug || slugify(event.target.value),
                      }))
                    }
                  />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="ID">
                    <Input
                      value={productForm.id}
                      placeholder="Se genera con el nombre"
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          id: slugify(event.target.value),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Slug">
                    <Input
                      value={productForm.slug}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          slug: slugify(event.target.value),
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Categoria">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={productForm.categoryId}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          categoryId: event.target.value,
                        }))
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Estado">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={productForm.status}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          status: event.target.value as StoreProduct["status"],
                        }))
                      }
                    >
                      <option value="active">Activo</option>
                      <option value="draft">Borrador</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </Field>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Precio">
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          price: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Precio anterior">
                    <Input
                      type="number"
                      value={productForm.compareAtPrice}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          compareAtPrice: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Stock">
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          stock: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Especie">
                    <Input
                      value={productForm.species}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          species: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Formato">
                    <Input
                      value={productForm.format}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          format: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Unidad">
                    <Input
                      value={productForm.unit}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          unit: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Promocion ID">
                    <Input
                      value={productForm.promotionId}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          promotionId: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Imagen URL">
                  <Input
                    value={productForm.image}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        image: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Subir imagen">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        imageFile: event.target.files?.[0] || null,
                      }))
                    }
                  />
                </Field>
                <Field label="Resumen corto">
                  <textarea
                    className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={productForm.shortDescription}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        shortDescription: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Descripcion">
                  <textarea
                    className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        description: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Badges (separados por coma)">
                  <Input
                    value={productForm.badges}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        badges: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Beneficios (separados por coma)">
                  <Input
                    value={productForm.benefits}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        benefits: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Ingredientes (separados por coma)">
                  <Input
                    value={productForm.ingredients}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        ingredients: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Ritual sugerido">
                  <Input
                    value={productForm.ritualTip}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        ritualTip: event.target.value,
                      }))
                    }
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        featured: event.target.checked,
                      }))
                    }
                  />
                  Destacar en homepage
                </label>
                <div className="flex gap-2">
                  <Button
                    className="rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
                    disabled={saving}
                    onClick={saveProduct}
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => setProductForm(emptyProductForm)}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="rounded-lg bg-white p-4">
                  <div className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="outline">{product.status}</Badge>
                        {product.featured && <Badge>Destacado</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-[#5d6f65]">
                        {product.shortDescription}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span>{formatCurrency(product.price)}</span>
                        <span>Stock {product.stock}</span>
                        <span>{product.categoryId}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setProductForm(productToForm(product))}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "promotions" && (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="rounded-lg bg-white p-5">
              <h2 className="text-xl font-semibold">Promocion</h2>
              <div className="mt-5 grid gap-4">
                <Field label="Titulo">
                  <Input
                    value={promotionForm.title}
                    onChange={(event) =>
                      setPromotionForm((form) => ({
                        ...form,
                        title: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="ID">
                  <Input
                    value={promotionForm.id}
                    placeholder="Se genera con el titulo"
                    onChange={(event) =>
                      setPromotionForm((form) => ({
                        ...form,
                        id: slugify(event.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Subtitulo">
                  <textarea
                    className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={promotionForm.subtitle}
                    onChange={(event) =>
                      setPromotionForm((form) => ({
                        ...form,
                        subtitle: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Codigo">
                    <Input
                      value={promotionForm.code}
                      onChange={(event) =>
                        setPromotionForm((form) => ({
                          ...form,
                          code: event.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Etiqueta descuento">
                    <Input
                      value={promotionForm.discountLabel}
                      placeholder="15% off"
                      onChange={(event) =>
                        setPromotionForm((form) => ({
                          ...form,
                          discountLabel: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Productos incluidos (IDs por coma)">
                  <Input
                    value={promotionForm.productIds}
                    onChange={(event) =>
                      setPromotionForm((form) => ({
                        ...form,
                        productIds: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Estado">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={promotionForm.status}
                    onChange={(event) =>
                      setPromotionForm((form) => ({
                        ...form,
                        status: event.target.value as StorePromotion["status"],
                      }))
                    }
                  >
                    <option value="active">Activa</option>
                    <option value="scheduled">Programada</option>
                    <option value="paused">Pausada</option>
                  </select>
                </Field>
                <Button
                  className="rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
                  onClick={savePromotion}
                >
                  <Save className="h-4 w-4" />
                  Guardar promocion
                </Button>
              </div>
            </Card>

            <div className="grid gap-4">
              {promotions.map((promotion) => (
                <Card key={promotion.id} className="rounded-lg bg-white p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {promotion.title}
                        </h3>
                        <Badge>{promotion.discountLabel}</Badge>
                        <Badge variant="outline">{promotion.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-[#5d6f65]">
                        {promotion.subtitle}
                      </p>
                      <p className="mt-2 text-xs text-[#89968d]">
                        Codigo {promotion.code || "sin codigo"} | Productos:{" "}
                        {promotion.productIds.join(", ") || "sin asignar"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() =>
                          setPromotionForm(promotionToForm(promotion))
                        }
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => deletePromotion(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "content" && (
          <Card className="rounded-lg bg-white p-5">
            <h2 className="text-xl font-semibold">Contenido de tienda</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Anuncio superior">
                <Input
                  value={content.announcement}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      announcement: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Eyebrow hero">
                <Input
                  value={content.heroEyebrow}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      heroEyebrow: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Titulo hero">
                <Input
                  value={content.heroTitle}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      heroTitle: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Imagen hero">
                <Input
                  value={content.heroImage}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      heroImage: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Subtitulo hero">
                <textarea
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={content.heroSubtitle}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      heroSubtitle: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Trust line">
                <textarea
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={content.trustLine}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      trustLine: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="CTA principal">
                <Input
                  value={content.primaryCta}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      primaryCta: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="CTA secundario">
                <Input
                  value={content.secondaryCta}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      secondaryCta: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="WhatsApp numero con codigo pais">
                <Input
                  value={content.whatsappNumber}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      whatsappNumber: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Mensaje WhatsApp">
                <textarea
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={content.whatsappMessage}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      whatsappMessage: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Nota footer">
                <textarea
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={content.footerNote}
                  onChange={(event) =>
                    setContent((value) => ({
                      ...value,
                      footerNote: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Button
              className="mt-5 rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
              onClick={saveContent}
            >
              <Save className="h-4 w-4" />
              Guardar contenido
            </Button>
          </Card>
        )}

        {tab === "categories" && (
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-lg bg-white p-5">
              <h2 className="text-xl font-semibold">Categoria</h2>
              <div className="mt-5 grid gap-4">
                <Field label="Nombre">
                  <Input
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((form) => ({
                        ...form,
                        name: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="ID">
                  <Input
                    value={categoryForm.id}
                    onChange={(event) =>
                      setCategoryForm((form) => ({
                        ...form,
                        id: slugify(event.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Descripcion">
                  <textarea
                    className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm((form) => ({
                        ...form,
                        description: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Imagen">
                  <Input
                    value={categoryForm.image}
                    onChange={(event) =>
                      setCategoryForm((form) => ({
                        ...form,
                        image: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Orden">
                  <Input
                    type="number"
                    value={categoryForm.order}
                    onChange={(event) =>
                      setCategoryForm((form) => ({
                        ...form,
                        order: Number(event.target.value),
                      }))
                    }
                  />
                </Field>
                <Button
                  className="rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
                  onClick={saveCategory}
                >
                  <Save className="h-4 w-4" />
                  Guardar categoria
                </Button>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <Card key={category.id} className="rounded-lg bg-white p-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="aspect-[4/2] w-full rounded-lg object-cover"
                  />
                  <h3 className="mt-4 text-lg font-semibold">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#5d6f65]">
                    {category.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setCategoryForm(category)}
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <Card className="rounded-lg bg-white p-5">
            <h2 className="text-xl font-semibold">Pedidos</h2>
            <p className="mt-2 text-sm text-[#5d6f65]">
              Se mantiene lectura de la coleccion actual `orders` para no romper
              historial. La V2 por ahora empuja pedidos por WhatsApp.
            </p>
            <Separator className="my-4" />
            <div className="grid gap-3">
              {orders.length ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-[#e3dccb] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {order.orderId || order.id}
                        </p>
                        <p className="text-sm text-[#5d6f65]">
                          {order.userEmail || "Cliente sin email"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{order.status || "nuevo"}</Badge>
                        <span className="font-semibold">
                          {formatCurrency(Number(order.total || 0))}
                        </span>
                      </div>
                    </div>
                    {order.items?.length ? (
                      <p className="mt-3 text-sm text-[#5d6f65]">
                        {order.items
                          .map((item) => `${item.Nombre} x${item.cantidad}`)
                          .join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-[#cdbf9e] p-6 text-center text-sm text-[#5d6f65]">
                  Todavia no hay pedidos registrados en Firestore.
                </p>
              )}
            </div>
          </Card>
        )}

        {tab === "admins" && (
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-lg bg-white p-5">
              <h2 className="text-xl font-semibold">Agregar administrador</h2>
              <Field label="Email">
                <Input
                  type="email"
                  value={newAdminEmail}
                  onChange={(event) => setNewAdminEmail(event.target.value)}
                  placeholder="correo@dominio.com"
                />
              </Field>
              <Button
                className="mt-4 rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
                onClick={addAdmin}
              >
                Agregar
              </Button>
            </Card>
            <Card className="rounded-lg bg-white p-5">
              <h2 className="text-xl font-semibold">Admins activos</h2>
              <div className="mt-4 grid gap-3">
                {admins.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-lg border border-[#e3dccb] p-3"
                  >
                    <span className="text-sm">{email}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => revokeAdmin(email)}
                    >
                      Revocar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "creative" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-lg bg-[#153328] p-6 text-white">
              <ImagePlus className="h-7 w-7 text-[#f5d58b]" />
              <h2 className="mt-4 text-2xl font-semibold">
                Produccion visual Higgsfield
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                No hay conector Higgsfield instalado en esta sesion, asi que
                deje prompts listos para generar contenido con el mismo sistema
                visual: bosque, apothecary premium, verde profundo y oro.
              </p>
            </Card>
            {higgsfieldCreativePrompts.map((item) => (
              <Card key={item.name} className="rounded-lg bg-white p-5">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-[#f7f3ea] p-4 text-sm leading-6 text-[#485b51]">
                  {item.prompt}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
