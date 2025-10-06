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
import { Bookmark, Plus } from "lucide-react";
import { analytics } from "../lib/firebase";
import { logEvent } from "firebase/analytics";

type Producto = {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
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

function useGoogleSheet(csvUrl: string) {
  const [data, setData] = useState<Producto[]>([]);

  useEffect(() => {
    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        const rows = text
          .trim()
          .split("\n")
          .map((row) => row.split(","));
        const headers = rows[0].map((header) => header.replace(/\r/g, ""));
        const json = rows.slice(1).map((row) => {
          const cleanedRow = row.map((cell) => cell.replace(/\r/g, ""));
          return Object.fromEntries(
            cleanedRow.map((cell, i) => [headers[i], cell])
          ) as Producto;
        });
        setData(json);
      });
  }, [csvUrl]);

  return data;
}

export default function Home() {
  const { activeFilter, setActiveFilter, searchQuery, priceRange } =
    useFilter();
  const { dispatch } = useCart();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const data = useGoogleSheet(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUIcUqIZi-QQVPcAPnpGr06n5gCj5r2qTOsWd-D3QGRWlu6aCKBkLIJBJOmbOEQMMQHP_6qzl1Mkir/pub?gid=1806455741&single=true&output=csv"
  );

  const categories = [
    { id: "todos", name: "Todos", count: data.length },
    {
      id: "promociones",
      name: "Promociones",
      count: data.filter((p) => p.promocion === "true").length,
    },
    {
      id: "cubensis",
      name: "Cubensis",
      count: data.filter(
        (p) =>
          p.Tipo?.toLowerCase().includes("cubensis") ||
          p.Subcategoria?.toLowerCase().includes("cubensis") ||
          p.Hongo?.toLowerCase().includes("cubensis")
      ).length,
    },
    {
      id: "medicinal",
      name: "Medicinal",
      count: data.filter(
        (p) =>
          p.Categoria?.toLowerCase().includes("medicinal") ||
          p.Tipo?.toLowerCase().includes("medicinal") ||
          p.Subcategoria?.toLowerCase().includes("medicinal")
      ).length,
    },
    {
      id: "comestible",
      name: "Comestible",
      count: data.filter(
        (p) =>
          p.Categoria?.toLowerCase().includes("comestible") ||
          p.Tipo?.toLowerCase().includes("comestible") ||
          p.Subcategoria?.toLowerCase().includes("comestible")
      ).length,
    },
    {
      id: "hongos",
      name: "Hongos",
      count: data.filter((p) => p.Categoria?.toLowerCase() === "hongos").length,
    },
    {
      id: "sustratos",
      name: "Sustratos",
      count: data.filter(
        (p) =>
          p.Categoria?.toLowerCase().includes("sustrato") ||
          p.Tipo?.toLowerCase().includes("sustrato") ||
          p.Subcategoria?.toLowerCase().includes("sustrato")
      ).length,
    },
    {
      id: "cultivos",
      name: "Cultivos",
      count: data.filter(
        (p) =>
          p.Categoria?.toLowerCase().includes("cultivo") ||
          p.Tipo?.toLowerCase().includes("cultivo") ||
          p.Subcategoria?.toLowerCase().includes("cultivo")
      ).length,
    },
    {
      id: "granos",
      name: "Granos",
      count: data.filter(
        (p) =>
          p.Categoria?.toLowerCase().includes("grano") ||
          p.Tipo?.toLowerCase().includes("grano") ||
          p.Subcategoria?.toLowerCase().includes("grano")
      ).length,
    },
    {
      id: "kits",
      name: "Kits",
      count: data.filter(
        (p) =>
          p.Categoria?.toLowerCase().includes("kit") ||
          p.Tipo?.toLowerCase().includes("kit") ||
          p.Subcategoria?.toLowerCase().includes("kit")
      ).length,
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
            item_name: producto.Hongo,
            item_category: producto.Categoria,
          },
        ],
      });
    } else {
      favoritesDispatch({
        type: "ADD_FAVORITE",
        payload: {
          ID: producto.ID,
          Hongo: producto.Hongo,
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
            item_name: producto.Hongo,
            item_category: producto.Categoria,
          },
        ],
      });
    }
  };

  const filteredProducts = data.filter((producto) => {
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
          producto.Hongo?.toLowerCase().includes("cubensis");
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
        producto.Hongo.toLowerCase().includes(query) ||
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
        return a.Hongo.localeCompare(b.Hongo);
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
        Hongo: producto.Hongo,
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
          item_name: producto.Hongo,
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
    setSelectedProduct(producto);
    setIsDialogOpen(true);

    // 📊 Analytics: Usuario vio detalles del producto
    logEvent(analytics, "view_item", {
      currency: "PEN",
      value: parseFloat(producto.precio),
      items: [
        {
          item_id: producto.ID,
          item_name: producto.Hongo,
          item_category: producto.Categoria,
          item_variant: producto.Tipo,
        },
      ],
    });
  };

  const openProductDialog = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsDialogOpen(true);
    handleProductClick(producto);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 lg:px-8 mt-16 mb-14 lg:mt-16">
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
                  onClick={() => openProductDialog(producto)}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`/${producto.image}`}
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
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      {producto.Hongo}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 dark:from-gray-900 dark:via-emerald-950/30 dark:to-amber-950/20 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl rounded-2xl backdrop-blur-sm">
          <DialogHeader className="pb-6 border-b border-emerald-100 dark:border-emerald-800/50">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
              {selectedProduct?.Hongo}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative pb-[100%] rounded-2xl overflow-hidden shadow-lg ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
                  <img
                    src={`/${selectedProduct.image}`}
                    alt={selectedProduct.Hongo}
                    className="absolute w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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

                <div className="space-y-6">
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedProduct.descripcion}
                    </p>
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
                              isFavorite(selectedProduct.ID)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          {isFavorite(selectedProduct.ID)
                            ? "Guardado"
                            : "Guardar"}
                        </Button>

                        <Button
                          onClick={(e) => {
                            handleAddToCart(selectedProduct, e);
                            setIsDialogOpen(false);
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
