import { useEffect, useState } from "react";
import { useFilter } from "@/contexts/filter-context";
import { useCart } from "../contexts/cart-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFavorites } from "../contexts/favorites-context";
import { useProductDialog } from "../contexts/product-dialog-context";
import { Bookmark, Plus } from "lucide-react";
import { analytics, db } from "../lib/firebase";
import { logEvent } from "firebase/analytics";
import { collection, getDocs } from "firebase/firestore";

type Producto = {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
  Nombre: string;
  stock: string;
  unidad: string;
  precio: string;
  image: string;
  descripcion: string;
  promocion?: string;
};

type Category = {
  id: string;
  name: string;
  count: number;
};

// Firestore product document shape
type FSProduct = {
  tipo?: string;
  categoria?: string;
  subcategoria?: string;
  hongo?: string;
  nombre?: string;
  stock?: number | string;
  unidad?: string;
  precio?: number | string;
  image?: string;
  descripcion?: string;
  promocion?: boolean | string;
};

function useFirestoreProducts() {
  const [data, setData] = useState<Producto[]>([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "products"));
      const json: Producto[] = snap.docs.map((d) => {
        const p = d.data() as FSProduct;
        return {
          ID: d.id,
          Tipo: String(p.tipo ?? ""),
          Categoria: String(p.categoria ?? ""),
          Subcategoria: String(p.subcategoria ?? ""),
          Hongo: String(p.hongo ?? ""),
          Nombre: String(p.nombre ?? ""),
          stock: String(p.stock ?? ""),
          unidad: String(p.unidad ?? ""),
          precio: String(p.precio ?? ""),
          image: String(p.image ?? ""),
          descripcion: String(p.descripcion ?? ""),
          promocion:
            p.promocion !== undefined ? String(p.promocion) : undefined,
        };
      });
      setData(json);
    };
    load();
  }, []);

  return data;
}

export default function Home() {
  const { activeFilter, setActiveFilter, searchQuery, priceRange } =
    useFilter();
  const { dispatch } = useCart();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const {
    selectedProduct,
    isDialogOpen,
    openProductDialog,
    closeProductDialog,
  } = useProductDialog();
  const { dispatch: favoritesDispatch, isFavorite } = useFavorites();

  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("featured");

  // Sincronizar selectedCategory con activeFilter
  useEffect(() => {
    if (activeFilter === "all" || activeFilter === "") {
      setSelectedCategory("todos");
    } else {
      setSelectedCategory(activeFilter);
    }
  }, [activeFilter]);

  const data = useFirestoreProducts();

  // Función para validar que un producto tenga los campos esenciales (solo precio y nombre)
  const isValidProduct = (producto: Producto): boolean => {
    return !!(
      producto.Nombre &&
      producto.precio &&
      producto.Nombre.trim() !== "" &&
      producto.precio.trim() !== "" &&
      !isNaN(parseFloat(producto.precio)) &&
      parseFloat(producto.precio) > 0
    );
  };

  // Filtrar solo productos válidos
  const validProducts = data.filter(isValidProduct);

  // Función para calcular el conteo considerando solo filtros de precio y búsqueda
  const getFilteredCountForCategory = (categoryId: string) => {
    return validProducts.filter((producto) => {
      const precio = parseFloat(producto.precio) || 0;
      let matchesCategory = true;

      // Aplicar filtro de categoría específica
      if (categoryId !== "todos") {
        if (categoryId === "promociones") {
          matchesCategory = producto.promocion === "true";
        } else if (categoryId === "cubensis") {
          matchesCategory =
            producto.Tipo?.toLowerCase().includes("cubensis") ||
            producto.Subcategoria?.toLowerCase().includes("cubensis") ||
            producto.Nombre?.toLowerCase().includes("cubensis");
        } else if (categoryId === "medicinal") {
          matchesCategory =
            producto.Categoria?.toLowerCase().includes("medicinal") ||
            producto.Tipo?.toLowerCase().includes("medicinal") ||
            producto.Subcategoria?.toLowerCase().includes("medicinal");
        } else if (categoryId === "comestible") {
          matchesCategory =
            producto.Categoria?.toLowerCase().includes("comestible") ||
            producto.Tipo?.toLowerCase().includes("comestible") ||
            producto.Subcategoria?.toLowerCase().includes("comestible");
        } else if (categoryId === "hongos") {
          matchesCategory = producto.Categoria?.toLowerCase() === "hongos";
        } else if (categoryId === "sustratos") {
          matchesCategory =
            producto.Categoria?.toLowerCase().includes("sustrato") ||
            producto.Tipo?.toLowerCase().includes("sustrato") ||
            producto.Subcategoria?.toLowerCase().includes("sustrato");
        } else if (categoryId === "cultivos") {
          matchesCategory =
            producto.Categoria?.toLowerCase().includes("cultivo") ||
            producto.Tipo?.toLowerCase().includes("cultivo") ||
            producto.Subcategoria?.toLowerCase().includes("cultivo");
        } else if (categoryId === "granos") {
          matchesCategory =
            producto.Categoria?.toLowerCase().includes("grano") ||
            producto.Tipo?.toLowerCase().includes("grano") ||
            producto.Subcategoria?.toLowerCase().includes("grano");
        } else if (categoryId === "kits") {
          matchesCategory =
            producto.Categoria?.toLowerCase().includes("kit") ||
            producto.Tipo?.toLowerCase().includes("kit") ||
            producto.Subcategoria?.toLowerCase().includes("kit");
        } else {
          matchesCategory =
            producto.Categoria?.toLowerCase() === categoryId.toLowerCase();
        }
      }

      // Aplicar filtro de precio
      let matchesPrice = true;
      if (priceRange.min !== null) {
        matchesPrice = precio >= priceRange.min;
      }
      if (priceRange.max !== null) {
        matchesPrice = matchesPrice && precio <= priceRange.max;
      }

      // Aplicar filtro de búsqueda
      let matchesSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          producto.Nombre.toLowerCase().includes(query) ||
          producto.Tipo.toLowerCase().includes(query) ||
          producto.Categoria.toLowerCase().includes(query) ||
          producto.Subcategoria.toLowerCase().includes(query) ||
          producto.precio.includes(query);
      }

      return matchesCategory && matchesPrice && matchesSearch;
    }).length;
  };

  const categories = [
    { id: "todos", name: "Todos", count: getFilteredCountForCategory("todos") },
    {
      id: "promociones",
      name: "Promociones",
      count: getFilteredCountForCategory("promociones"),
    },
    {
      id: "cubensis",
      name: "Cubensis",
      count: getFilteredCountForCategory("cubensis"),
    },
    {
      id: "medicinal",
      name: "Medicinal",
      count: getFilteredCountForCategory("medicinal"),
    },
    {
      id: "comestible",
      name: "Comestible",
      count: getFilteredCountForCategory("comestible"),
    },
    {
      id: "hongos",
      name: "Hongos",
      count: getFilteredCountForCategory("hongos"),
    },
    {
      id: "sustratos",
      name: "Sustratos",
      count: getFilteredCountForCategory("sustratos"),
    },
    {
      id: "cultivos",
      name: "Cultivos",
      count: getFilteredCountForCategory("cultivos"),
    },
    {
      id: "granos",
      name: "Granos",
      count: getFilteredCountForCategory("granos"),
    },
    {
      id: "kits",
      name: "Kits",
      count: getFilteredCountForCategory("kits"),
    },
  ];

  const handleAddToFavorites = (producto: Producto, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFavorite(producto.ID)) {
      favoritesDispatch({ type: "REMOVE_FAVORITE", payload: producto.ID });
      // 📊 Analytics: Producto removido de guardados
      logEvent(analytics, "remove_from_wishlist", {
        currency: "PEN",
        value: parseFloat(producto.precio),
        items: [
          {
            item_id: producto.ID,
            item_name: producto.Nombre,
            item_category: producto.Categoria,
          },
        ],
      });
    } else {
      favoritesDispatch({
        type: "ADD_FAVORITE",
        payload: {
          ID: producto.ID,
          Nombre: producto.Nombre,
          precio: producto.precio,
          image: producto.image,
          Tipo: producto.Tipo,
          Categoria: producto.Categoria,
          descripcion: producto.descripcion,
          addedAt: Date.now(),
        },
      });
      // 📊 Analytics: Producto agregado a guardados
      logEvent(analytics, "add_to_wishlist", {
        currency: "PEN",
        value: parseFloat(producto.precio),
        items: [
          {
            item_id: producto.ID,
            item_name: producto.Nombre,
            item_category: producto.Categoria,
          },
        ],
      });
    }
  };

  const filteredProducts = validProducts.filter((producto) => {
    const precio = parseFloat(producto.precio) || 0;
    let matchesFilter = true;
    let matchesCategory = true;

    // Filter by selected category
    if (selectedCategory !== "todos") {
      if (selectedCategory === "promociones") {
        matchesCategory = producto.promocion === "true";
      } else if (selectedCategory === "cubensis") {
        matchesCategory =
          producto.Tipo?.toLowerCase().includes("cubensis") ||
          producto.Subcategoria?.toLowerCase().includes("cubensis") ||
          producto.Nombre?.toLowerCase().includes("cubensis");
      } else if (selectedCategory === "medicinal") {
        matchesCategory =
          producto.Categoria?.toLowerCase().includes("medicinal") ||
          producto.Tipo?.toLowerCase().includes("medicinal") ||
          producto.Subcategoria?.toLowerCase().includes("medicinal");
      } else if (selectedCategory === "comestible") {
        matchesCategory =
          producto.Categoria?.toLowerCase().includes("comestible") ||
          producto.Tipo?.toLowerCase().includes("comestible") ||
          producto.Subcategoria?.toLowerCase().includes("comestible");
      } else if (selectedCategory === "hongos") {
        matchesCategory = producto.Categoria?.toLowerCase() === "hongos";
      } else if (selectedCategory === "sustratos") {
        matchesCategory =
          producto.Categoria?.toLowerCase().includes("sustrato") ||
          producto.Tipo?.toLowerCase().includes("sustrato") ||
          producto.Subcategoria?.toLowerCase().includes("sustrato");
      } else if (selectedCategory === "cultivos") {
        matchesCategory =
          producto.Categoria?.toLowerCase().includes("cultivo") ||
          producto.Tipo?.toLowerCase().includes("cultivo") ||
          producto.Subcategoria?.toLowerCase().includes("cultivo");
      } else if (selectedCategory === "granos") {
        matchesCategory =
          producto.Categoria?.toLowerCase().includes("grano") ||
          producto.Tipo?.toLowerCase().includes("grano") ||
          producto.Subcategoria?.toLowerCase().includes("grano");
      } else if (selectedCategory === "kits") {
        matchesCategory =
          producto.Categoria?.toLowerCase().includes("kit") ||
          producto.Tipo?.toLowerCase().includes("kit") ||
          producto.Subcategoria?.toLowerCase().includes("kit");
      } else {
        matchesCategory =
          producto.Categoria?.toLowerCase() === selectedCategory.toLowerCase();
      }
    }

    if (activeFilter && activeFilter !== "all") {
      if (activeFilter === "promociones") {
        matchesFilter = producto.promocion === "true";
      } else if (activeFilter === "cubensis") {
        matchesFilter =
          producto.Tipo?.toLowerCase().includes("cubensis") ||
          producto.Subcategoria?.toLowerCase().includes("cubensis") ||
          producto.Nombre?.toLowerCase().includes("cubensis");
      } else if (activeFilter === "medicinal") {
        matchesFilter =
          producto.Categoria?.toLowerCase().includes("medicinal") ||
          producto.Tipo?.toLowerCase().includes("medicinal") ||
          producto.Subcategoria?.toLowerCase().includes("medicinal");
      } else if (activeFilter === "comestible") {
        matchesFilter =
          producto.Categoria?.toLowerCase().includes("comestible") ||
          producto.Tipo?.toLowerCase().includes("comestible") ||
          producto.Subcategoria?.toLowerCase().includes("comestible");
      } else if (activeFilter === "hongos") {
        matchesFilter = producto.Categoria?.toLowerCase() === "hongos";
      } else if (activeFilter === "sustratos") {
        matchesFilter =
          producto.Categoria?.toLowerCase().includes("sustrato") ||
          producto.Tipo?.toLowerCase().includes("sustrato") ||
          producto.Subcategoria?.toLowerCase().includes("sustrato");
      } else if (activeFilter === "cultivos") {
        matchesFilter =
          producto.Categoria?.toLowerCase().includes("cultivo") ||
          producto.Tipo?.toLowerCase().includes("cultivo") ||
          producto.Subcategoria?.toLowerCase().includes("cultivo");
      } else if (activeFilter === "granos") {
        matchesFilter =
          producto.Categoria?.toLowerCase().includes("grano") ||
          producto.Tipo?.toLowerCase().includes("grano") ||
          producto.Subcategoria?.toLowerCase().includes("grano");
      } else if (activeFilter === "kits") {
        matchesFilter =
          producto.Categoria?.toLowerCase().includes("kit") ||
          producto.Tipo?.toLowerCase().includes("kit") ||
          producto.Subcategoria?.toLowerCase().includes("kit");
      } else {
        matchesFilter =
          producto.Categoria?.toLowerCase() === activeFilter.toLowerCase() ||
          producto.Subcategoria?.toLowerCase() === activeFilter.toLowerCase() ||
          producto.Tipo?.toLowerCase() === activeFilter.toLowerCase();
      }
    }

    let matchesPrice = true;
    if (priceRange.min !== null) {
      matchesPrice = precio >= priceRange.min;
    }
    if (priceRange.max !== null) {
      matchesPrice = matchesPrice && precio <= priceRange.max;
    }

    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        producto.Nombre.toLowerCase().includes(query) ||
        producto.Tipo.toLowerCase().includes(query) ||
        producto.Categoria.toLowerCase().includes(query) ||
        producto.Subcategoria.toLowerCase().includes(query) ||
        producto.precio.includes(query);
    }

    return matchesCategory && matchesFilter && matchesPrice && matchesSearch;
  });

  // Sort products based on sortBy state
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.precio) - parseFloat(b.precio);
      case "price-high":
        return parseFloat(b.precio) - parseFloat(a.precio);
      case "name":
        return a.Nombre.localeCompare(b.Nombre);
      case "featured":
      default:
        return 0; // Keep original order
    }
  });

  const handleAddToCart = (producto: Producto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click se propague al contenedor padre
    dispatch({
      type: "ADD_ITEM",
      payload: {
        ID: producto.ID,
        Nombre: producto.Nombre,
        precio: producto.precio,
        image: producto.image,
        cantidad: 1,
      },
    });

    // 📊 Analytics: Producto agregado al carrito
    logEvent(analytics, "add_to_cart", {
      currency: "PEN",
      value: parseFloat(producto.precio),
      items: [
        {
          item_id: producto.ID,
          item_name: producto.Nombre,
          item_category: producto.Categoria,
          item_variant: producto.Tipo,
          price: parseFloat(producto.precio),
          quantity: 1,
        },
      ],
    });

    setAddedItems((prev) => ({ ...prev, [producto.ID]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [producto.ID]: false }));
    }, 1000);
  };
  // Agregar evento cuando ven detalles del producto:
  const handleProductClick = (producto: Producto) => {
    openProductDialog(producto);

    // 📊 Analytics: Usuario vio detalles del producto
    logEvent(analytics, "view_item", {
      currency: "PEN",
      value: parseFloat(producto.precio),
      items: [
        {
          item_id: producto.ID,
          item_name: producto.Nombre,
          item_category: producto.Categoria,
          item_variant: producto.Tipo,
        },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 lg:px-8 mt-32 mb-14 lg:mt-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar - Como estaba originalmente */}
          <div className="hidden lg:block lg:w-64 space-y-6">
            {/* Sort Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-emerald-800 dark:text-amber-300 mb-4">
                Ordenar por
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="featured">Destacados</option>
                <option value="newest">Más nuevos</option>
                <option value="price-low">Precio: Menor a mayor</option>
                <option value="price-high">Precio: Mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-emerald-800 dark:text-amber-300 mb-4">
                Categorías
              </h3>
              <div className="space-y-2">
                {categories.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveFilter(
                        category.id === "todos" ? "all" : category.id
                      );
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm">({category.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-emerald-800 dark:text-amber-300 text-center lg:text-left">
              {activeFilter && activeFilter !== "all"
                ? `Productos: ${activeFilter}`
                : "Todos nuestros productos"}
            </h1>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {sortedProducts.map((producto) => (
                <div
                  key={producto.ID}
                  onClick={() => handleProductClick(producto)}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={producto.image}
                      alt={producto.Hongo}
                      className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {producto.promocion === "true" && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Oferta
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToFavorites(producto, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          isFavorite(producto.ID)
                            ? "fill-blue-500 text-blue-500"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-3 right-3 z-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(producto, e)}
                        className={`transition-all duration-300 ${
                          addedItems[producto.ID]
                            ? "bg-green-600 hover:bg-green-700 scale-110 shadow-lg"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {addedItems[producto.ID] ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">✓</span>
                            <span>Agregado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            <span>Agregar</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {producto.Nombre || producto.Hongo}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          S/{producto.precio}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {producto.Categoria}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Dialog - Enhanced */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeProductDialog()}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 dark:from-gray-900 dark:via-emerald-950/30 dark:to-amber-950/20 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl rounded-2xl backdrop-blur-sm">
          <DialogHeader className="pb-6 border-b border-emerald-100 dark:border-emerald-800/50">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
              {selectedProduct?.Hongo}
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm italic text-gray-600 dark:text-gray-400 font-medium">
                <span className="text-emerald-600 dark:text-amber-400">
                  Nombre científico:
                </span>{" "}
                {selectedProduct?.Nombre}
              </p>
            </div>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 py-6">
              {/* Imagen centrada y cuadrada en la parte superior */}
              <div className="flex justify-center">
                <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-lg ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.Hongo}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {/* Botón de guardados en el diálogo */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleAddToFavorites(selectedProduct, e)}
                    className={`absolute top-3 right-3 h-12 w-12 p-0 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                      isFavorite(selectedProduct.ID)
                        ? "bg-blue-500/90 hover:bg-blue-600 text-white scale-110"
                        : "bg-white/90 hover:bg-white text-gray-600 hover:text-blue-500 hover:scale-110"
                    }`}
                  >
                    <Bookmark
                      className={`h-6 w-6 transition-all duration-300 ${
                        isFavorite(selectedProduct.ID) ? "fill-current" : ""
                      }`}
                    />
                  </Button>

                  {/* Badge de promoción si aplica */}
                  {selectedProduct.promocion === "true" && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ¡Promoción!
                    </div>
                  )}
                </div>
              </div>

              {/* Contenedores de detalles en 2 columnas en desktop, 1 columna en móvil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="font-semibold text-lg text-emerald-800 dark:text-amber-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Detalles
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Tipo:</span>{" "}
                      {selectedProduct.Tipo}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Categoría:</span>{" "}
                      {selectedProduct.Categoria}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Subcategoría:</span>{" "}
                      {selectedProduct.Subcategoria}
                    </p>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="font-semibold text-lg text-emerald-800 dark:text-amber-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Disponibilidad
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {selectedProduct.stock}
                    </span>{" "}
                    {selectedProduct.unidad} disponibles
                  </p>
                </div>

                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="font-semibold text-lg text-emerald-800 dark:text-amber-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Descripción
                  </h3>
                  <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-amber-400 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-2">
                      {selectedProduct.descripcion}
                    </p>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="font-semibold text-lg text-emerald-800 dark:text-amber-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Precio
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-700 dark:text-amber-400">
                        S/{selectedProduct.precio}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={(e) =>
                          handleAddToFavorites(selectedProduct, e)
                        }
                        variant="outline"
                        size="lg"
                        className={`h-11 transition-all duration-200 ${
                          isFavorite(selectedProduct.ID)
                            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 mr-2 ${
                            isFavorite(selectedProduct.ID) ? "fill-current" : ""
                          }`}
                        />
                        {isFavorite(selectedProduct.ID)
                          ? "Guardado"
                          : "Guardar"}
                      </Button>

                      <Button
                        onClick={(e) => {
                          handleAddToCart(selectedProduct, e);
                          closeProductDialog();
                        }}
                        size="lg"
                        className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
