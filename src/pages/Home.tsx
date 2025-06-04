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
import { Heart } from "lucide-react";
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
  const { activeFilter, searchQuery, priceRange } = useFilter();
  const { dispatch } = useCart();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { dispatch: favoritesDispatch, isFavorite } = useFavorites();
  const [favoritedItems, setFavoritedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const handleAddToFavorites = (producto: Producto, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFavorite(producto.ID)) {
      favoritesDispatch({ type: "REMOVE_FAVORITE", payload: producto.ID });
      // 📊 Analytics: Producto removido de favoritos
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
      // 📊 Analytics: Producto agregado a favoritos
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

    setFavoritedItems((prev) => ({ ...prev, [producto.ID]: true }));
    setTimeout(() => {
      setFavoritedItems((prev) => ({ ...prev, [producto.ID]: false }));
    }, 500);
  };

  const data = useGoogleSheet(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUIcUqIZi-QQVPcAPnpGr06n5gCj5r2qTOsWd-D3QGRWlu6aCKBkLIJBJOmbOEQMMQHP_6qzl1Mkir/pub?gid=1806455741&single=true&output=csv"
  );

  const filteredProducts = data.filter((producto) => {
    const precio = parseFloat(producto.precio) || 0;
    let matchesFilter = true;

    if (activeFilter && activeFilter !== "all") {
      if (activeFilter === "promociones") {
        matchesFilter = producto.promocion === "true";
      } else {
        matchesFilter =
          producto.Categoria === activeFilter ||
          producto.Subcategoria === activeFilter ||
          producto.Tipo === activeFilter;
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

    return matchesFilter && matchesPrice && matchesSearch;
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
    <div className="px-4 py-6 lg:px-8 mt-42 mb-14 lg:mt-28">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-emerald-800 dark:text-amber-300  text-center lg:text-left">
        {activeFilter
          ? `Productos: ${activeFilter}`
          : "Todos nuestros productos"}
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {filteredProducts.map((producto) => (
          <div
            key={producto.ID}
            onClick={() => openProductDialog(producto)}
            className="group border border-amber-100 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            {/* Contenedor de imagen con efecto de zoom */}
            <div className="relative pb-[100%] mb-3 rounded-md overflow-hidden">
              <img
                src={`/${producto.image}`}
                alt={producto.Hongo}
                className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Botón de favoritos */}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleAddToFavorites(producto, e)}
                className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                  isFavorite(producto.ID)
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white/80 hover:bg-white text-gray-600 hover:text-red-500"
                } ${favoritedItems[producto.ID] ? "scale-125" : "scale-100"}`}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 ${
                    isFavorite(producto.ID) ? "fill-current" : ""
                  }`}
                />
              </Button>
              {/* Badge de promoción si existe */}
              {producto.promocion === "true" && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Oferta
                </div>
              )}
            </div>

            {/* Información mínima */}
            <h2 className="text-base lg:text-lg font-semibold text-emerald-800 dark:text-amber-200 mb-1 line-clamp-1">
              {producto.Hongo}
            </h2>

            <div className="flex items-center justify-between mt-auto">
              <p className="font-bold text-emerald-700 dark:text-amber-400 text-base lg:text-lg">
                S/{producto.precio}
              </p>
              <button
                onClick={(e) => handleAddToCart(producto, e)}
                className={`px-2 lg:px-3 py-1 text-xs lg:text-sm ${
                  addedItems[producto.ID]
                    ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    : "bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700"
                } 
                  text-emerald-800 dark:text-white rounded transition-all duration-150 font-medium min-w-[2rem] group-hover:opacity-100 opacity-90`}
              >
                {addedItems[producto.ID] ? "✓" : "+"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* También puedes agregar el botón de favoritos en el diálogo del producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-800 dark:text-amber-300">
              {selectedProduct?.Hongo}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative pb-[100%] rounded-md overflow-hidden">
                  <img
                    src={`/${selectedProduct.image}`}
                    alt={selectedProduct.Hongo}
                    className="absolute w-full h-full object-cover"
                  />
                  {/* Botón de favoritos en el diálogo */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleAddToFavorites(selectedProduct, e)}
                    className={`absolute top-2 right-2 h-10 w-10 p-0 rounded-full transition-all duration-200 ${
                      isFavorite(selectedProduct.ID)
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white/80 hover:bg-white text-gray-600 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-200 ${
                        isFavorite(selectedProduct.ID) ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 dark:text-amber-200">
                      Detalles
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedProduct.Tipo} • {selectedProduct.Categoria} •{" "}
                      {selectedProduct.Subcategoria}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 dark:text-amber-200">
                      Disponibilidad
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedProduct.stock} {selectedProduct.unidad} restantes
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 dark:text-amber-200">
                      Descripción
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedProduct.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="font-bold text-xl text-emerald-700 dark:text-amber-400">
                      S/{selectedProduct.precio}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) =>
                          handleAddToFavorites(selectedProduct, e)
                        }
                        variant="outline"
                        className={`${
                          isFavorite(selectedProduct.ID)
                            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${
                            isFavorite(selectedProduct.ID) ? "fill-current" : ""
                          }`}
                        />
                        {isFavorite(selectedProduct.ID)
                          ? "En favoritos"
                          : "Favorito"}
                      </Button>
                      <Button
                        onClick={(e) => {
                          handleAddToCart(selectedProduct, e);
                          setIsDialogOpen(false);
                        }}
                        className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700 text-emerald-800 dark:text-white"
                      >
                        Añadir al carrito
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
