import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowDownUp,
  Bookmark,
  Check,
  Leaf,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useFavorites } from "@/contexts/favorites-context";
import { useFilter } from "@/contexts/filter-context";
import { useProductDialog } from "@/contexts/product-dialog-context";
import {
  formatCurrency,
  StoreCategory,
  StoreProduct,
  StorePromotion,
  toLegacyProduct,
} from "@/lib/storefront-v2";
import { fetchStorefrontV2 } from "@/services/storefrontV2Service";

type SortKey = "featured" | "price-low" | "price-high" | "name";

export default function Home() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [promotions, setPromotions] = useState<StorePromotion[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { activeFilter, setActiveFilter, searchQuery, priceRange, resetFilters } =
    useFilter();
  const { dispatch } = useCart();
  const { dispatch: favoritesDispatch, isFavorite } = useFavorites();
  const {
    selectedProduct,
    isDialogOpen,
    openProductDialog,
    closeProductDialog,
  } = useProductDialog();

  useEffect(() => {
    const load = async () => {
      const data = await fetchStorefrontV2();
      setProducts(data.products);
      setCategories(data.categories);
      setPromotions(data.promotions);
      setUsingDemo(data.usingDemo);
    };
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("categoria");
    if (category) setActiveFilter(category);
  }, [location.search, setActiveFilter]);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const selectedCategory =
    activeFilter && activeFilter !== "all" ? activeFilter : "all";

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.status === "active");
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = activeProducts.filter((product) => {
      const category = categoryById.get(product.categoryId);
      const searchable = [
        product.name,
        product.species,
        product.format,
        product.shortDescription,
        category?.name || "",
        product.badges.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;
      const matchesMin =
        priceRange.min === null || product.price >= priceRange.min;
      const matchesMax =
        priceRange.max === null || product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });

    return result.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured);
    });
  }, [
    activeProducts,
    categoryById,
    priceRange.max,
    priceRange.min,
    searchQuery,
    selectedCategory,
    sortBy,
  ]);

  const featuredPromo = promotions.find((promo) => promo.status === "active");
  const currentProduct = selectedProduct
    ? products.find((product) => product.id === selectedProduct.ID)
    : null;

  const getCategoryName = (categoryId: string) =>
    categoryById.get(categoryId)?.name || categoryId;

  const handleProductClick = (product: StoreProduct) => {
    openProductDialog(toLegacyProduct(product, getCategoryName(product.categoryId)));
  };

  const handleAddToCart = (product: StoreProduct, event?: React.MouseEvent) => {
    event?.stopPropagation();
    dispatch({
      type: "ADD_ITEM",
      payload: {
        ID: product.id,
        Nombre: product.name,
        precio: String(product.price),
        image: product.image,
        cantidad: 1,
      },
    });
    setAddedItems((previous) => ({ ...previous, [product.id]: true }));
    window.setTimeout(() => {
      setAddedItems((previous) => ({ ...previous, [product.id]: false }));
    }, 1200);
  };

  const handleFavorite = (product: StoreProduct, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isFavorite(product.id)) {
      favoritesDispatch({ type: "REMOVE_FAVORITE", payload: product.id });
      return;
    }
    favoritesDispatch({
      type: "ADD_FAVORITE",
      payload: {
        ID: product.id,
        Nombre: product.name,
        precio: String(product.price),
        image: product.image,
        Tipo: product.format,
        Categoria: getCategoryName(product.categoryId),
        descripcion: product.shortDescription,
        addedAt: Date.now(),
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f3ea] pb-24 text-[#153328] md:pb-8">
      <section className="relative overflow-hidden bg-[#10241d] pt-28 text-white md:pt-24">
        <div className="absolute inset-0">
          <img
            src="/brand/hero-apothecary-v2.webp"
            alt="Productos botanicos de Zeta Dorada"
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,24,18,0.96),rgba(9,24,18,0.78)_42%,rgba(9,24,18,0.24))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <Badge className="border-[#d8b56d]/40 bg-[#d8b56d]/15 text-[#f5d58b]">
              Tienda V2 experimental
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
              Catalogo premium para hongos medicinales.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#e9e0c9] md:text-lg">
              Productos mock editables desde admin, promociones listas para
              campanas y una experiencia pensada para convertir visitas en
              pedidos por WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="h-11 rounded-lg bg-[#d8b56d] px-5 text-[#10241d] hover:bg-[#f0cc7d]"
                onClick={() => document.getElementById("catalogo")?.scrollIntoView()}
              >
                Ver productos
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-lg border-white/30 bg-white/10 px-5 text-white hover:bg-white/20"
                onClick={() => setActiveFilter("kits")}
              >
                Ver kits
              </Button>
            </div>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-3 lg:self-end">
            {[
              { icon: ShieldCheck, label: "Compra asistida" },
              { icon: Leaf, label: "Linea naturalista" },
              { icon: PackageCheck, label: "Admin editable" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <item.icon className="h-5 w-5 text-[#f0cc7d]" />
                <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {usingDemo && (
          <div className="mb-6 rounded-lg border border-[#d8b56d]/40 bg-[#fff8e6] p-4 text-sm text-[#6a5122]">
            Estas viendo contenido demo V2. Desde el panel admin puedes sembrar
            esta estructura en Firestore y editarla para el cliente.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-[#a67c28]" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#a67c28]">
                  Promocion activa
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#153328]">
                  {featuredPromo?.title || "Campanas listas para vender"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5d6f65]">
                  {featuredPromo?.subtitle ||
                    "Crea codigos, bundles y mensajes de campana desde admin."}
                </p>
              </div>
            </div>
            {featuredPromo && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-[#153328] text-white">
                  {featuredPromo.discountLabel}
                </Badge>
                <Badge variant="outline" className="border-[#d8b56d]">
                  Codigo {featuredPromo.code}
                </Badge>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-[#153328] p-5 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#f0cc7d]">
              Categorias
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                className={
                  selectedCategory === "all"
                    ? "rounded-lg bg-[#d8b56d] text-[#153328] hover:bg-[#f0cc7d]"
                    : "rounded-lg border-white/25 bg-white/5 text-white hover:bg-white/15"
                }
                onClick={() => setActiveFilter("all")}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={
                    selectedCategory === category.id
                      ? "rounded-lg bg-[#d8b56d] text-[#153328] hover:bg-[#f0cc7d]"
                      : "rounded-lg border-white/25 bg-white/5 text-white hover:bg-white/15"
                  }
                  onClick={() => setActiveFilter(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm text-[#5d6f65]">
              {filteredProducts.length} productos encontrados
            </p>
            <h2 className="text-2xl font-semibold text-[#153328]">
              {selectedCategory === "all"
                ? "Seleccion premium"
                : getCategoryName(selectedCategory)}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(searchQuery || selectedCategory !== "all" || priceRange.min || priceRange.max) && (
              <Button
                variant="outline"
                className="rounded-lg border-[#d7d0bd]"
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
            )}
            <label className="flex items-center gap-2 rounded-lg border border-[#d7d0bd] bg-[#fbfaf6] px-3 py-2 text-sm">
              <ArrowDownUp className="h-4 w-4 text-[#6f7f74]" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="bg-transparent text-[#153328] outline-none"
              >
                <option value="featured">Destacados</option>
                <option value="price-low">Precio menor</option>
                <option value="price-high">Precio mayor</option>
                <option value="name">Nombre</option>
              </select>
            </label>
          </div>
        </div>

        {filteredProducts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#e3dccb] transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#10241d]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {product.badges.slice(0, 2).map((badge) => (
                      <Badge
                        key={badge}
                        className="bg-white/90 text-[#153328] backdrop-blur"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <button
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-[#153328] backdrop-blur transition hover:bg-white"
                    onClick={(event) => handleFavorite(product, event)}
                    aria-label="Guardar producto"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        isFavorite(product.id) ? "fill-[#d8b56d] text-[#d8b56d]" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#a67c28]">
                    {getCategoryName(product.categoryId)}
                  </p>
                  <h3 className="mt-1 min-h-12 text-lg font-semibold leading-6 text-[#153328]">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#5d6f65]">
                    {product.shortDescription}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-[#153328]">
                        {formatCurrency(product.price)}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-sm text-[#89968d] line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className={`rounded-lg ${
                        addedItems[product.id]
                          ? "bg-[#2f7d50] text-white"
                          : "bg-[#153328] text-white hover:bg-[#24503f]"
                      }`}
                      onClick={(event) => handleAddToCart(product, event)}
                    >
                      {addedItems[product.id] ? (
                        <>
                          <Check className="h-4 w-4" />
                          Listo
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Agregar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#b8ad95] bg-white p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-[#a67c28]" />
            <h3 className="mt-3 text-xl font-semibold text-[#153328]">
              No encontramos productos
            </h3>
            <p className="mt-2 text-sm text-[#5d6f65]">
              Ajusta busqueda, categoria o precio para ver mas opciones.
            </p>
          </div>
        )}
      </section>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeProductDialog()}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-lg border-[#d8b56d]/30 bg-[#fbfaf6] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#153328]">
              {currentProduct?.name || selectedProduct?.Nombre}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-lg bg-[#10241d]">
                <img
                  src={currentProduct?.image || selectedProduct.image}
                  alt={currentProduct?.name || selectedProduct.Nombre}
                  className="aspect-square h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {(currentProduct?.badges || [selectedProduct.Subcategoria])
                    .filter(Boolean)
                    .map((badge) => (
                      <Badge key={badge} className="bg-[#153328] text-white">
                        {badge}
                      </Badge>
                    ))}
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[#a67c28]">
                  {currentProduct
                    ? getCategoryName(currentProduct.categoryId)
                    : selectedProduct.Categoria}
                </p>
                <p className="mt-3 leading-7 text-[#485b51]">
                  {currentProduct?.description || selectedProduct.descripcion}
                </p>

                {currentProduct && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {currentProduct.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="rounded-lg border border-[#e3dccb] bg-white p-3 text-sm text-[#153328]"
                      >
                        <Check className="mb-2 h-4 w-4 text-[#2f7d50]" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 rounded-lg bg-white p-4">
                  <p className="text-sm text-[#5d6f65]">Ritual sugerido</p>
                  <p className="mt-1 text-sm font-medium text-[#153328]">
                    {currentProduct?.ritualTip ||
                      "Agrega este producto al pedido y confirma por WhatsApp."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold text-[#153328]">
                      {formatCurrency(
                        currentProduct?.price || Number(selectedProduct.precio)
                      )}
                    </p>
                    {currentProduct?.compareAtPrice && (
                      <p className="text-sm text-[#89968d] line-through">
                        {formatCurrency(currentProduct.compareAtPrice)}
                      </p>
                    )}
                  </div>
                  <Button
                    className="h-11 rounded-lg bg-[#153328] px-5 text-white hover:bg-[#24503f]"
                    onClick={() => {
                      if (currentProduct) handleAddToCart(currentProduct);
                      closeProductDialog();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
